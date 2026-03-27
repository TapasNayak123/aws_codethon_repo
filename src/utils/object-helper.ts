/**
 * Object Helper Utilities
 */

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function mergeObjects<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

export function getNestedValue<T extends Record<string, any>>(obj: T, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function setNestedValue<T extends Record<string, any>>(obj: T, path: string, value: any): T {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
  return obj;
}

export function pickProperties<T extends Record<string, any>>(obj: T, keys: string[]): Pick<T, typeof keys[number]> {
  const result: Pick<T, typeof keys[number]> = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function omitProperties<T extends Record<string, any>>(obj: T, keys: string[]): Omit<T, typeof keys[number]> {
  const result: Omit<T, typeof keys[number]> = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function flattenObject<T extends Record<string, any>>(obj: T, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(result, flattenObject(obj[key] as Record<string, any>, newKey));
    } else {
      result[newKey] = obj[key];
    }
  }
  
  return result;
}