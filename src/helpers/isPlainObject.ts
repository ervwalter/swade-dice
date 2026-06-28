/**
 * Returns true if `o` is a plain object (an object literal or one created via
 * `Object.create(null)`), as opposed to an array, class instance, or other
 * exotic object.
 *
 * Ported from the `is-plain-object` package, which no longer exposes its type
 * declarations under modern ("bundler"/"node16") module resolution.
 */
function isObject(o: unknown): boolean {
  return Object.prototype.toString.call(o) === "[object Object]";
}

export function isPlainObject(o: unknown): boolean {
  if (isObject(o) === false) return false;

  // If has modified constructor
  const ctor = (o as { constructor?: unknown }).constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  const prot = (ctor as { prototype?: unknown }).prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}
