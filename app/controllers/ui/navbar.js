/**
 * # The nav bar UI controller
 * 
 *  This serves as a custom, top nav bar for both iOS and Android.  iOS still uses
 * a real nav group but defaults to navBarHidden: true so we can use this module.
 * 
 * @class Controllers.UI.navbar
 */

/**
 * Params for this instance of the navbar
 * @type {Object}
 */
$.params = arguments[0];


/**
 * Set sidebar button 
 */
if($.params.sidebar) {
	$.settingsBtn.visible = true;
}

/**
 * Set Nav bar title
 */
if($.params.title) {
	$.title.text = $.params.title;
}


