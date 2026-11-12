"use client";
import { useEffect, useMemo, type DependencyList } from "react";

/**
 * useMemo for hand-made three.js resources (geometries, materials) that
 * disposes the previous value when it is replaced and on unmount.
 */
export function useDisposable<T extends { dispose: () => void }>(
  factory: () => T,
  deps: DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps);
  useEffect(() => () => value.dispose(), [value]);
  return value;
}
