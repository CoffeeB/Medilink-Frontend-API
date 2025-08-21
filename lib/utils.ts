import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Type guard to check if a value is considered empty
 * @param value - The value to check for emptiness
 * @returns Boolean indicating if the value is empty
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isEmpty(value: any): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' &&
      value !== null &&
      Object.keys(value).length === 0)
  );
}

/**
* Deeply cleans an object or array by removing empty values
* @param data - The input data to clean
* @returns Cleaned data with empty values removed
*/
export function cleanData<T>(data: T): T {
  // Handle primitive types and null/undefined
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data
      .map(item => typeof item === 'object' ? cleanData(item) : item)
      .filter(item => !isEmpty(item)) as T;
  }

  // Handle objects
  if (typeof data === 'object') {
    const cleaned = {} as T;

    Object.entries(data).forEach(([key, value]) => {
      // Recursively clean nested objects
      const cleanedValue = typeof value === 'object'
        ? cleanData(value)
        : value;

      // Only add non-empty values to the cleaned object
      if (!isEmpty(cleanedValue)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (cleaned as any)[key] = cleanedValue;
      }
    });

    return cleaned;
  }

  return data;
}
