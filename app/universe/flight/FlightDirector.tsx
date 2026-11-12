"use client";
import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Matrix4, Quaternion, Vector3, type PerspectiveCamera } from "three";
import { DESTINATIONS } from "../config/destinations";
import { prefersReducedMotion } from "../lib/capabilities";
import { rig } from "../state/rig";
import { useUniverse, type UniverseState } from "../state/store";
import {
  BASE_FOV,
  LAUNCH_DISTANCE,
  ORBIT_SPEED,
  buildTravelPath,
  chaseShot,
  clamp,
  copyShot,
  createShot,
  defaultOrbitAngle,
  hubForward,
  hubPosition,
  introShot,
  lerpShot,
  orbitPosition,
  orbitShot,
  orbitTangent,
  overviewShot,
  pathPoint,
  pathTangent,
  smoothstep,
  travelDuration,
  type TravelPath,
  type View,
} from "./paths";

/**
 * FlightDirector — the only writer of `rig` and the only code that moves the
 * camera. Scripted moves (launch, travel) are GSAP timelines that tween the
 * plain numbers in `script`; useFrame turns those numbers into a ship pose
 * and a camera goal. The camera never cuts: it is a damped follower of the
 * goal shot, so every change of phase eases, and `snap` forces an instant
 * placement (first frame, skip, jump).
 */

/* ---- module-scope scratch: nothing below is allocated per frame ---- */
const UP = new Vector3(0, 1, 0);
const ORIGIN = new Vector3(0, 0, 0);
const AXIS_Z = new Vector3(0, 0, 1);
const HUB_FORWARD = hubForward(new Vector3());

const _forward = new Vector3();
const _prevForward = new Vector3();
const _tangent = new Vector3();
const _m4 = new Matrix4();
const _qLook = new Quaternion();
const _qRoll = new Quaternion();
const _goal = createShot();
const _shotB = createShot();
const _view: View = { aspect: 1, width: 1280, fov: BASE_FOV };

/** Smoothed camera state actually applied to the camera. */
const cam = createShot();

/** Numbers tweened by GSAP. */
const script = {
  /** travel: bezier parameter 0..1 */
  t: 0,
  /** launch: distance run from the hub */
  d: 0,
  /** launch: 0 = intro shot, 1 = chase shot */
  chase: 0,
  /** launch: 0 = chase shot, 1 = system overview */
  blend: 0,
  thrust: 0,
  warp: 0,
};

const FOV_KICK = 14;
/** Camera follow rate (1/s) per phase; higher = tighter. */
const FOLLOW: Record<UniverseState["phase"], number> = {
  intro: 3,
  launching: 2.6,
  galaxy: 2.6,
  travelling: 5.5,
  orbit: 2.4,
};

const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

export function FlightDirector() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;

  useEffect(() => {
    let timeline: gsap.core.Timeline | null = null;
    const reduced = prefersReducedMotion();

    /* ---- per-instance mutable state, shared with the frame loop ---- */
    const fd = state;
    fd.snap = true;
    fd.path = null;
    fd.follow = FOLLOW.intro;
    fd.roll = 0;
    fd.reduced = reduced;

    const killTimeline = () => {
      if (timeline) {
        timeline.kill();
        timeline = null;
      }
    };

    const placeInOrbit = (id: NonNullable<UniverseState["location"]>) => {
      const dest = DESTINATIONS[id];
      fd.orbitAngle = defaultOrbitAngle(dest);
      orbitPosition(dest, fd.orbitAngle, rig.shipPosition);
      orbitTangent(fd.orbitAngle, _forward);
      fd.hasForward = true;
      rig.thrust = 0;
      rig.warp = 0;
      script.thrust = 0;
      script.warp = 0;
      fd.snap = true;
    };

    const startLaunch = () => {
      killTimeline();
      script.d = 0;
      script.chase = 0;
      script.blend = 0;
      script.thrust = rig.thrust;
      script.warp = 0;
      const tl = gsap.timeline({
        onComplete: () => {
          timeline = null;
          // Park where the run ends, even when skipped before a frame rendered it.
          hubPosition(LAUNCH_DISTANCE, rig.shipPosition);
          useUniverse.getState().launchComplete();
        },
      });
      if (reduced) {
        tl.to(script, { d: LAUNCH_DISTANCE, chase: 1, blend: 1, duration: 0.6, ease: "power2.inOut" }, 0);
        tl.to(script, { thrust: 0.6, duration: 0.2, ease: "power1.out" }, 0);
        tl.to(script, { thrust: 0, duration: 0.3, ease: "power1.in" }, 0.3);
      } else {
        // spool → hold → run → pull up to the overview (3.5 s)
        tl.to(script, { thrust: 1, duration: 1.0, ease: "power2.in" }, 0);
        tl.to(script, { chase: 1, duration: 1.3, ease: "power2.inOut" }, 0.9);
        tl.to(script, { d: LAUNCH_DISTANCE, duration: 2.0, ease: "power3.inOut" }, 1.25);
        tl.to(script, { warp: 1, duration: 0.9, ease: "power2.in" }, 1.3);
        tl.to(script, { warp: 0, duration: 1.0, ease: "power2.out" }, 2.4);
        tl.to(script, { blend: 1, duration: 1.4, ease: "power2.inOut" }, 2.1);
        tl.to(script, { thrust: 0, duration: 0.6, ease: "power2.out" }, 2.9);
      }
      timeline = tl;
    };

    const startTravel = (s: UniverseState) => {
      killTimeline();
      const targetId = s.target;
      if (!targetId) return;
      // Leave along the current heading (the orbit tangent when in orbit).
      if (!fd.hasForward) _forward.copy(HUB_FORWARD);
      const path = buildTravelPath(rig.shipPosition, _forward, targetId);
      fd.path = path;
      const duration = travelDuration(s.location, targetId, path.length, reduced);
      const hop = duration < 3;
      const entryAngle = path.entryAngle;

      script.t = 0;
      script.thrust = rig.thrust;
      script.warp = 0;
      const tl = gsap.timeline({
        onComplete: () => {
          timeline = null;
          fd.orbitAngle = entryAngle;
          pathPoint(path, 1, rig.shipPosition);
          useUniverse.getState().arrive();
        },
      });
      tl.to(script, { t: 1, duration, ease: "power2.inOut" }, 0);
      if (reduced) {
        tl.to(script, { thrust: 0.5, duration: 0.2 }, 0);
        tl.to(script, { thrust: 0.1, duration: 0.3 }, 0.3);
      } else {
        const ease = Math.min(1.2, duration * 0.3);
        tl.to(script, { thrust: 1, duration: 0.5, ease: "power2.out" }, 0);
        tl.to(script, { thrust: 0.12, duration: ease, ease: "power2.inOut" }, duration - ease);
        tl.to(script, { warp: hop ? 0.3 : 1, duration: duration * 0.38, ease: "power2.in" }, duration * 0.08);
        tl.to(script, { warp: 0, duration: duration * 0.36, ease: "power2.out" }, duration * 0.6);
      }
      timeline = tl;
    };

    /* ---- bring the rig in line with whatever state we mounted into ---- */
    const initial = useUniverse.getState();
    fd.phase = initial.phase;
    if (initial.phase === "intro" || initial.phase === "launching") {
      hubPosition(0, rig.shipPosition);
      _forward.copy(HUB_FORWARD);
      fd.hasForward = true;
      if (initial.phase === "launching") startLaunch();
    } else if (initial.phase === "travelling") {
      if (initial.location) placeInOrbit(initial.location);
      startTravel(initial);
    } else if (initial.location) {
      placeInOrbit(initial.location);
    } else {
      hubPosition(LAUNCH_DISTANCE, rig.shipPosition);
      _forward.copy(HUB_FORWARD);
      fd.hasForward = true;
    }

    const unsubscribe = useUniverse.subscribe((s, prev) => {
      if (s.jumpNonce !== prev.jumpNonce) {
        // Jump: no flight at all, straight to the orbit pose.
        killTimeline();
        fd.path = null;
        if (s.location) placeInOrbit(s.location);
        return;
      }
      if (s.skipNonce !== prev.skipNonce) {
        if (timeline && (s.phase === "launching" || s.phase === "travelling")) {
          fd.snap = true;
          timeline.progress(1); // fires onComplete → launchComplete() / arrive()
        }
        return;
      }
      if (s.phase !== prev.phase) {
        if (s.phase === "launching") startLaunch();
        else if (s.phase === "travelling") startTravel(s);
        else if (s.phase === "intro") {
          killTimeline();
          hubPosition(0, rig.shipPosition);
          _forward.copy(HUB_FORWARD);
          fd.snap = true;
        }
      } else if (s.phase === "travelling" && s.target !== prev.target) {
        startTravel(s);
      }
    });

    return () => {
      unsubscribe();
      killTimeline();
      fd.path = null;
    };
  }, []);

  useFrame((three, delta) => {
    const fd = state;
    const dt = Math.min(delta, 0.1);
    const time = three.clock.elapsedTime;
    const s = useUniverse.getState();
    const phase = s.phase;

    _view.aspect = three.size.width / Math.max(three.size.height, 1);
    _view.width = three.size.width;

    // Ease into a new shot instead of lunging at it, except where the goal is
    // continuous across the phase change.
    if (phase !== fd.phase) {
      const continuous =
        (fd.phase === "intro" && phase === "launching") ||
        (fd.phase === "launching" && phase === "galaxy") ||
        (fd.phase === "travelling" && phase === "orbit");
      if (!continuous) fd.follow = Math.min(fd.follow, 0.5);
      fd.phase = phase;
    }

    _prevForward.copy(_forward);
    let bank = 0;
    let scripted = false;
    let idleThrust = 0;

    /* ---------------- ship pose + camera goal ---------------- */
    if (phase === "intro") {
      hubPosition(0, rig.shipPosition);
      rig.shipPosition.y += Math.sin(time * 0.6) * 0.12;
      _forward.copy(HUB_FORWARD);
      // Slow drift plus a little pointer parallax.
      const swayX = Math.sin(time * 0.13) * 0.45 + three.pointer.x * 0.5;
      const swayY = Math.cos(time * 0.17) * 0.25 + three.pointer.y * 0.3;
      introShot(rig.shipPosition, _forward, _view, swayX, swayY, _goal);
    } else if (phase === "launching") {
      scripted = true;
      hubPosition(script.d, rig.shipPosition);
      _forward.copy(HUB_FORWARD);
      introShot(rig.shipPosition, _forward, _view, 0, 0, _goal);
      if (script.chase > 0) {
        chaseShot(rig.shipPosition, _forward, _view, _shotB);
        lerpShot(_goal, _shotB, script.chase);
      }
      if (script.blend > 0) {
        overviewShot(_view, 0, _shotB);
        lerpShot(_goal, _shotB, script.blend);
      }
    } else if (phase === "travelling" && fd.path) {
      scripted = true;
      const path = fd.path;
      pathPoint(path, script.t, rig.shipPosition);
      pathTangent(path, script.t, _tangent);
      if (_tangent.lengthSq() > 1e-8) _forward.copy(_tangent).normalize();
      chaseShot(rig.shipPosition, _forward, _view, _goal);
      // Final quarter: hand over to the orbit shot so arrival is seamless.
      const settle = smoothstep(0.72, 1, script.t);
      if (settle > 0 && s.target) {
        orbitShot(DESTINATIONS[s.target], path.entryAngle, _view, _shotB);
        lerpShot(_goal, _shotB, settle);
      }
    } else {
      // galaxy / orbit: parked at the hub, or circling `location`.
      const dest = s.location ? DESTINATIONS[s.location] : null;
      if (dest) {
        fd.orbitAngle -= ORBIT_SPEED * dt;
        orbitPosition(dest, fd.orbitAngle, rig.shipPosition);
        orbitTangent(fd.orbitAngle, _forward);
        bank = -0.12;
        idleThrust = 0.08;
      }
      if (phase === "orbit" && dest) {
        orbitShot(dest, fd.orbitAngle, _view, _goal);
      } else {
        overviewShot(_view, Math.sin(time * 0.05) * 0.05, _goal);
      }
    }
    fd.hasForward = true;

    /* ---------------- engines ---------------- */
    if (scripted) {
      rig.thrust = script.thrust;
      rig.warp = fd.reduced ? 0 : script.warp;
    } else {
      const k = damp(2.5, dt);
      rig.thrust += (idleThrust - rig.thrust) * k;
      rig.warp += (0 - rig.warp) * k;
      if (rig.warp < 1e-4) rig.warp = 0;
    }

    /* ---------------- ship attitude: nose (-Z) along velocity, bank in turns ---------------- */
    const yawRate = fd.snap
      ? 0
      : (_prevForward.z * _forward.x - _prevForward.x * _forward.z) / Math.max(dt, 1e-3);
    const rollGoal = clamp(yawRate * 0.9, -0.7, 0.7) + bank;
    fd.roll = fd.snap ? bank : fd.roll + (rollGoal - fd.roll) * damp(3, dt);
    _m4.lookAt(ORIGIN, _forward, UP);
    _qLook.setFromRotationMatrix(_m4);
    _qRoll.setFromAxisAngle(AXIS_Z, fd.roll);
    _qLook.multiply(_qRoll);
    if (fd.snap) rig.shipQuaternion.copy(_qLook);
    else rig.shipQuaternion.slerp(_qLook, damp(7, dt));

    /* ---------------- camera ---------------- */
    if (fd.snap) {
      copyShot(cam, _goal);
      fd.follow = FOLLOW[phase];
    } else {
      if (fd.reduced) fd.follow = 9;
      else fd.follow += (FOLLOW[phase] - fd.follow) * damp(1.8, dt);
      lerpShot(cam, _goal, damp(fd.follow, dt));
    }

    const fovGoal = BASE_FOV + FOV_KICK * rig.warp;
    const fov = fd.snap ? fovGoal : camera.fov + (fovGoal - camera.fov) * damp(4, dt);
    if (Math.abs(fov - camera.fov) > 1e-3) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    // Look at the subject, then turn the camera so the subject lands at the
    // requested screen position (nx, ny in NDC) instead of dead centre.
    const tanV = Math.tan((camera.fov * Math.PI) / 360);
    camera.position.copy(cam.pos);
    camera.lookAt(cam.look);
    if (cam.nx !== 0) camera.rotateY(Math.atan(cam.nx * tanV * _view.aspect));
    if (cam.ny !== 0) camera.rotateX(-Math.atan(cam.ny * tanV));

    fd.snap = false;
  });

  return null;
}

/** State shared between the store subscription and the frame loop. */
const state: {
  phase: UniverseState["phase"];
  snap: boolean;
  path: TravelPath | null;
  orbitAngle: number;
  follow: number;
  roll: number;
  hasForward: boolean;
  reduced: boolean;
} = {
  phase: "intro",
  snap: true,
  path: null,
  orbitAngle: 0,
  follow: FOLLOW.intro,
  roll: 0,
  hasForward: false,
  reduced: false,
};
