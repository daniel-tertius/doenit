/**
 * @typedef {Object} Task
 * @property {string} id - Primary key (UUID).
 * @property {boolean} archived - Indicates if the task is archived.
 * @property {string} created_at - Timestamp when the task was created.
 * @property {string} name - Name of the task.
 * @property {string} description - Description of the task.
 * @property {number} completed - The number of times the task has been completed (for repeatable tasks).
 * @property {string|null} completed_at - Timestamp when the task was last completed, or null if never completed.
 * @property {string} updated_at - Timestamp when the task was last updated.
 * @property {string|null} due_date - Due date of the task (format: "YYYY-MM-DD HH:mm" or "YYYY-MM-DD"), or null.
 * @property {string|null} start_date - Start date of the task (format: "YYYY-MM-DD HH:mm" or "YYYY-MM-DD"), or null.
 * @property {string} repeat_interval - Interval for repeating the task.
 * @property {(0|1|2|3|4|5|6)[]} repeat_specific_days - Array of days of the week (0-6, where 0 is Sunday) for repeating the task.
 * @property {number} repeat_interval_number - Number representing the repeat interval.
 * @property {boolean} important - Indicates if the task is marked as important.
 * @property {string} [category_id] - Optional category ID associated with the task.
 * @property {string|null} [room_id] - Optional room ID for shared tasks.
 */

/**
 * Represents a category for tasks.
 * @typedef {Object} Category
 * @property {string} id - Primary key (UUID).
 * @property {boolean} [is_default] - Indicates if this is the default category.
 * @property {boolean} archived - Indicates if the category is archived.
 * @property {string} created_at - Timestamp when the category was created.
 * @property {string} updated_at - Timestamp when the category was last updated.
 * @property {string} name - Name of the category.
 */

/**
 * Represents a room for shared tasks.
 * @typedef {Object} Room
 * @property {boolean} archived - Indicates if the room is archived.
 * @property {string} id - Primary key (UUID).
 * @property {string} name - Name of the room.
 * @property {boolean} [pending]
 * @property {{ email: string, pending?: boolean }[]} users - Array of user emails in the room.
 * @property {string} updated_at - Timestamp when the room was last updated.
 * @property {string} created_at - Timestamp when the room was created.
 */

/**
 * @typedef {Object} BackupManifest
 * @property {string} timestamp - ISO string timestamp of when the backup was created.
 * @property {string} user_id - User identifier.
 * @property {string} file_path - Path to the backup file.
 * @property {string} sha256 - SHA-256 hash of the backup file (used to verify integrity and avoid duplicate backups).
 * @property {number} size - Size of the backup file in bytes.
 */

/**
 * @template T
 * @typedef {{ success: true, data: T } | { success: false, error_message: string, data?: * }} Result<T>
 */

/**
 * @typedef {'dark' | 'light'} ThemeValue
 */

/**
 * @typedef {{ success: true } | { success: false, error_message: string }} SimpleResult
 */
