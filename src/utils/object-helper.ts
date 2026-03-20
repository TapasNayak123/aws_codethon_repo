/**
 * Object Helper Utilities
 */

// ISSUE 1: No type annotations at all
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ISSUE 2: Using any type
export function mergeObjects(obj1: any, obj2: any): any {
  return { ...obj1, ...obj2 };
}

// ISSUE 3: Unused variable and console.log
export function getNestedValue(obj: Record<string, any>, path: string): any {
  const unusedDebugVar = 'debugging';
  console.log('Getting nested value for path:', path);
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// ISSUE 4: Missing return type and error handling
export function setNestedValue(obj: Record<string, any>, path: string, value: any) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
  return obj;
}

// ISSUE 5: Using var and missing semicolon
export function pickProperties(obj: Record<string, any>, keys: string[]): Record<string, any> {
  var result = {}
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] in obj) {
      result[keys[i]] = obj[keys[i]];
    }
  }
  return result
}

// ISSUE 6: Inefficient implementation
export function omitProperties(obj: Record<string, any>, keys: string[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    let shouldInclude = true;
    for (let i = 0; i < keys.length; i++) {
      if (key === keys[i]) {
        shouldInclude = false;
        break;
      }
    }
    if (shouldInclude) {
      result[key] = obj[key];
    }
  }
  return result;
}

// ISSUE 7: Missing null/undefined checks
export function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object') {
      Object.assign(result, flattenObject(obj[key], newKey));
    } else {
      result[newKey] = obj[key];
    }
  }
  
  return result;
}

// ISSUE 8: Incorrect type usage and missing validation
export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}
