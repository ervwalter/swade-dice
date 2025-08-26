/**
 * Generate a random number in range `min` to `max`
 * Uses Math.random() for non-deterministic randomness
 */
export function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
