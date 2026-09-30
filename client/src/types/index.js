/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'STUDENT'|'FACULTY'|'WARDEN'|'MAINTENANCE'|'SECURITY'|'ACCOUNTS'|'ADMIN'} role
 * @property {string} [avatar]
 * @property {string} [token]
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} [message]
 * @property {*} [data]
 * @property {Object} [error]
 * @property {string} [error.code]
 * @property {string} [error.message]
 */

export const Types = {};
export default Types;
