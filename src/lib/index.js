/**
 * @param {string} date
 */
export function displayDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("af-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Sorts an array of objects by a specified field name.
 *
 * @template T extends Object
 * @param {Array<T>} array - The array of objects to be sorted.
 * @param {keyof T} field_name - The name of the field to sort by.
 * @param {('asc'|'desc')} [order='asc'] - The order of sorting: 'asc' for ascending, 'desc' for descending.
 * @returns {T[]} - The sorted array.
 *
 * @example
 * const data = [
 *   { name: 'John', age: 25 },
 *   { name: 'Jane', age: 22 },
 *   { name: 'Bob', age: 30 }
 * ];
 *
 * const sortedByName = sortByField(data, 'name');
 * // sortedByName = [{ name: 'Bob', age: 30 }, { name: 'Jane', age: 22 }, { name: 'John', age: 25 }]
 *
 * const sortedByAgeDesc = sortByField(data, 'age', 'desc');
 * // sortedByAgeDesc = [{ name: 'Bob', age: 30 }, { name: 'John', age: 25 }, { name: 'Jane', age: 22 }]
 */
export function sortByField(array, field_name, order = "asc") {
  const is_asc = order === "asc";

  return array.sort((a, b) => {
    if (typeof a[field_name] === "number" && typeof b[field_name] === "number") {
      return is_asc ? a[field_name] - b[field_name] : b[field_name] - a[field_name];
    } else {
      const a_str = String(a[field_name] ?? "");
      const b_str = String(b[field_name] ?? "");

      return is_asc ? a_str.localeCompare(b_str) : b_str.localeCompare(a_str);
    }
  });
}
