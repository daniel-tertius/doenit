/**
 * @typedef {Object} Task
 * @property {string} id - Primary key (UUID).
 * @property {boolean} archived - Indicates if the task is archived.
 * @property {string} created_at - Timestamp when the task was created.
 * @property {string} name - Name of the task.
 * @property {string} description - Description of the task.
 * @property {number} completed - The number of times the task has been completed (for repeatable tasks).
 * @property {string|null} completed_at - Timestamp when the task was last completed, or null if never completed.
 * @property {string|null} due_date - Due date of the task (format: "YYYY-MM-DD HH:mm" or "YYYY-MM-DD"), or null.
 * @property {string|null} start_date - Start date of the task (format: "YYYY-MM-DD HH:mm" or "YYYY-MM-DD"), or null.
 * @property {string} repeat_interval - Interval for repeating the task.
 * @property {(0|1|2|3|4|5|6)[]} repeat_specific_days - Array of days of the week (0-6, where 0 is Sunday) for repeating the task.
 * @property {number} repeat_interval_number - Number representing the repeat interval.
 * @property {boolean} important - Indicates if the task is marked as important.
 * @property {boolean} urgent - Indicates if the task is marked as urgent.
 * @property {string} [category_id] - Optional category ID associated with the task.
 */

/**
 * Represents a category for tasks.
 * @typedef {Object} Category
 * @property {string} id - Primary key (UUID).
 * @property {boolean} [is_default] - Indicates if this is the default category.
 * @property {boolean} archived - Indicates if the category is archived.
 * @property {string} created_at - Timestamp when the category was created.
 * @property {string} name - Name of the category.
 */

/**
 * @typedef {Object} DB
 * @property {import('$lib/RxDB/Table').Table<Task>} Task - The table interface for Task entities.
 * @property {import('$lib/RxDB/Table').Table<Category>} Category - The table interface for Category entities.
 */
