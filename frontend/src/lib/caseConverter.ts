export const toCamel = (str: string) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
export const toSnake = (str: string) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const keysToCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToCamel(v));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((result, key) => {
      result[toCamel(key) as keyof typeof result] = keysToCamel(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

export const keysToSnake = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToSnake(v));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((result, key) => {
      result[toSnake(key) as keyof typeof result] = keysToSnake(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};
