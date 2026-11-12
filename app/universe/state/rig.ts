import { Quaternion, Vector3 } from "three";
import { HUB } from "../config/destinations";

/**
 * Per-frame mutable flight state. NOT React state: nothing here triggers a
 * render. FlightDirector writes it (via GSAP / useFrame); the scene reads it
 * in useFrame.
 *
 *   writer:  app/universe/flight/*
 *   readers: app/universe/scene/* (Ship, Starfield, effects), hud (map blip)
 */
export const rig = {
  shipPosition: new Vector3(...HUB.shipPosition),
  shipQuaternion: new Quaternion(),
  /** 0..1 engine output; drives engine glow / exhaust length. */
  thrust: 0,
  /** 0..1 high-speed travel factor; drives star streaks and FOV kick. */
  warp: 0,
};
