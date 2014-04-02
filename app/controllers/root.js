/**
 * # The root screen controller
 * @class Controllers.root
 * @uses core
 */

var App = require("core");

/**
 * Content controller reference
 * @type {Controllers}
 */
$.contentController = {};

// if ios7, set top 
if(OS_IOS){
	if(Alloy.Globals.iOS7){
		$.rootWindow.setTop(20);
	}
}

// Just adding the home content initially.
$.contentController = Alloy.createController("home");



