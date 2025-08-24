/**
 * Random number generator wrapper
 * Now uses Math.random() internally since we no longer need deterministic synchronization
 */
export class SeededRandom {
  // Seed is kept for compatibility but not used
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed || Date.now();
  }
  
  /**
   * Generate next random number
   * Returns a number between 0 and 1 (like Math.random())
   */
  next(): number {
    return Math.random();
  }
  
  /**
   * Generate random number in range [min, max)
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  
  /**
   * Generate random integer in range [min, max] inclusive
   */
  rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
}

/**
 * Create a new SeededRandom instance with a deterministic seed
 * @param baseSeed Optional base seed, defaults to timestamp
 */
export function createSeededRandom(baseSeed?: number): SeededRandom {
  // Use a deterministic source if no seed provided
  const seed = baseSeed ?? Date.now();
  return new SeededRandom(seed);
}

/**
 * Derive a seed for a specific die based on its position in the array
 * Kept for compatibility but returns a simple combination since we use Math.random()
 * @param masterSeed The master seed for the roll
 * @param dieIndex The index of the die in the dice array
 */
export function deriveDieSeed(masterSeed: number, dieIndex: number): number {
  // Simple combination for compatibility - actual randomness comes from Math.random()
  return masterSeed + dieIndex;
}

/**
 * Derive a seed for an explosion based on die array index and explosion count
 * Kept for compatibility but returns a simple combination since we use Math.random()
 * @param masterSeed The master seed for the roll
 * @param dieIndex The index of the die in the original dice array
 * @param explosionIndex Which explosion this is (0 for first, 1 for second, etc.)
 */
export function deriveExplosionSeed(masterSeed: number, dieIndex: number, explosionIndex: number): number {
  // Simple combination for compatibility - actual randomness comes from Math.random()
  return masterSeed + dieIndex + explosionIndex;
}