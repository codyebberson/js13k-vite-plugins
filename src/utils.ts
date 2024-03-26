import fs from 'node:fs';
import path from 'node:path';

/**
 * A type that represents a value that can be enabled or disabled.
 */
export type EnabledOptions<T> = T | false;

/**
 * Escapes a string so that it can be used in a regular expression.
 * @param str The string to escape.
 * @returns The escaped string.
 */
export function escapeRegExp(str: string): string {
  // https://stackoverflow.com/a/6969486/2051724
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Adds default values to an object.
 * Performs nested merge and mutates the base object.
 * @param a The base object. This object will be mutated. This would normally be user specified values.
 * @param b The object to merge into the base object. This object will not be mutated. This would normally be default values.
 * @returns The merged object.
 */
export function addDefaultValues<T extends Record<string, any>>(a: T | undefined, b: T): T {
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

export function printJs13kStats(prefix: string, size: number): void {
  const percent = ((size / 13_312) * 100).toFixed(2);
  console.log(`${prefix} size: ${size} bytes (${percent}% of 13 KB)`);
}

export function isObject(item: unknown): boolean {
  return !!item && typeof item === 'object';
}

// Utils from vite-plugin-imagemin
// Source: https://github.com/vbenjs/vite-plugin-imagemin/blob/main/packages/core/src/utils.ts

export function isFunction(arg: unknown): arg is (...args: any[]) => any {
  return typeof arg === 'function';
}

export function isBoolean(arg: unknown): arg is boolean {
  return typeof arg === 'boolean';
}

export function isNotFalse(arg: unknown): arg is boolean {
  return !(isBoolean(arg) && !arg);
}

export function isRegExp(arg: unknown): arg is RegExp {
  return Object.prototype.toString.call(arg) === '[object RegExp]';
}

/**
 * Read all files in the specified folder, filter through regular rules, and return file path array
 * @param root Specify the folder path
 * [@param] reg Regular expression for filtering files, optional parameters
 * Note: It can also be deformed to check whether the file path conforms to regular rules. The path can be a folder or a file. The path that does not exist is also fault-tolerant.
 */
export function readAllFiles(root: string, reg?: RegExp) {
  let resultArr: string[] = [];
  try {
    if (fs.existsSync(root)) {
      const stat = fs.lstatSync(root);
      if (stat.isDirectory()) {
        const files = fs.readdirSync(root);
        for (const file of files) {
          const t = readAllFiles(path.join(root, '/', file), reg);
          resultArr = resultArr.concat(t);
        }
      } else {
        if (reg !== undefined) {
          if (isFunction(reg.test) && reg.test(root)) {
            resultArr.push(root);
          }
        } else {
          resultArr.push(root);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  return resultArr;
}
