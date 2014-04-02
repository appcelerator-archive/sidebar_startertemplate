/**
 * # The detail screen controller
 * @class Controllers.detail
 */

/**
 * Params passed to this instance
 * @type {Object}
 */
var params = arguments[0] || {};

/**
 * Set the value on title label 
 */
$.title.text = params.name ? params.name+"'s Price : " + params.price : 'Item';

