import { useSyncExternalStore } from "react";

/* can this page draw a shaders.com mesh: WebGPU present and motion not
   reduced — read once on the client (false on the server), by the
   Testimonial study card and the Features Security card. A plain
   useState set in an effect trips the React compiler lint. */
const noSubscribe = () => () => {};
export const canMesh = () => "gpu" in navigator && !matchMedia("(prefers-reduced-motion: reduce)").matches;
export const useCanMesh = () => useSyncExternalStore(noSubscribe, canMesh, () => false);
