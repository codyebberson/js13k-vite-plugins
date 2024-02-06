/**
 * Escapes a string so that it can be used in a regular expression.
 * @param str The string to escape.
 * @returns The escaped string.
 */
export function escapeRegExp(str: string): string {
  // https://stackoverflow.com/a/6969486/2051724
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

/**
 * Adds default values to an object.
 * Performs nested merge and mutates the base object.
 * @param a The base object. This object will be mutated. This would normally be user specified values.
 * @param b The object to merge into the base object. This object will not be mutated. This would normally be default values.
 * @returns The merged object.
 */
export function addDefaultValues<T extends Record<string, any>>(
  a: T | undefined,
  b: T
): T {
  if (!a) {
    return b;
  }
  for (const [k, v] of Object.entries(b) as [keyof T, any][]) {
    if (a[k] === undefined) {
      a[k] = v;
    } else if (isObject(v) && isObject(a[k])) {
      a[k] = addDefaultValues(a[k], v);
    }
  }
  return a;
}

function isObject(item: unknown): boolean {
  return !!item && typeof item === "object";
}
