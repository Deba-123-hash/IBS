/**
 * @typedef {Object} AuthenticatedRequest
 * @property {Object} user
 * @property {string} user.id
 * @property {string} user.email
 * @property {string} user.role
 * @property {string} [user.firstName]
 * @property {string} [user.lastName]
 */

/**
 * @typedef {Object} StandardApiResponse
 * @property {boolean} success
 * @property {string} [message]
 * @property {*} [data]
 * @property {Object} [error]
 * @property {string} [error.code]
 * @property {string} [error.message]
 */

export const ServerTypes = {};
export default ServerTypes;
