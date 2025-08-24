/**
 * Generate a random number in range `min` to `max`
 * This is the legacy helper that uses Math.random()
 * For deterministic randomness, use SeededRandom directly
 */
export function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
