/**
 * # The sidebar menu controller
 *
 * **NOTE:**  This should be used as a singleton for iOS only and referenced
 * via {@link core#Sidebar}
 *
 * ## Purpose
 * The sidebar menu is like the facebook-esque slide out panel.
 * The sidebar sits behind the {@link core#GlobalWindow} on iOS and behind all
 * views of any controller on Android/Mobile Web.
 *
 * On **iOS**, the GlobalWindow is moved over to show the
 * sidebar window behind it.  On iOS, the sidebar is directly accessible via {@link core#Sidebar}
 *
 * On **Android**, since you can't move heavyweight windows in android, the sidebar menu is
 * a child of the controller's window and sits behind sibling views.  On Android, the sidebar is
 * accessible via a controller's reference: `someController.sidebar`
 * 
 * On **Mobile Web**, same structure is followed as android.So the sidebar is
 * accessible via a controller's reference: `someController.sidebar`
 * 
 * To open / close the sidebar on the current screen, the following methods should be called:
 *
 * **iOS:**
 *      App.Sidebar.openSidebar();
 *      App.Sidebar.closeSidebar();
 *
 * **Android/MobileWeb:**
 *      someController.sidebar.openSidebar();
 *      someController.sidebar.closeSidebar();
 *
 * @class Controllers.UI.sidebar
 * @uses core * 
 * @uses Controllers.UI.sidebarContent
 */

var App = require("core");

/**
 * The current object reference that has opened
 * @type {Controllers}
 * @platform android
 */
$.currentObject = {};



/**
 * Current state of this sidebar
 * @type {boolean}
 */
$.isToggled = false;

/**
 * blocker view to restrict the touch for right panel
 */
$.viewBlocker = Ti.UI.createView({
	opacity : 0.25,
	width : Ti.UI.FILL,
	height : Ti.UI.FILL,
	backgroundColor : '#000'
});


/**
 * If ios7, set window top property as 20
 */
if( OS_IOS ){	
	if( Alloy.Globals.iOS7 ){
		$.wrapper.setTop( 20 );	
	}	
}

/**
 * Open the sidebar
 * @param {Object} _object TiUI object _optional_ ** Android/Mobile Web Only **
 */
$.openSidebar = function(_object) {
	if (OS_IOS) {
		App.GlobalWindow.add($.viewBlocker);
		App.NavGroup.animate({
			left : 240,
			curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
			duration : 150
		});
	} else {
		_object.add($.viewBlocker);
		_object.animate({
			left : 240,
			duration : 120
		});
		$.currentObject = _object;
	}
	$.isToggled = true;
};

/**
 * Close the sidebar
 */
$.closeSidebar = function() {
	
	if (OS_IOS ) {
		App.GlobalWindow.remove($.viewBlocker);
		App.NavGroup.animate({
			left : 0,
			curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
			duration : 150
		});
	} else {
		if ($.currentObject) {
			$.currentObject.remove($.viewBlocker);
			$.currentObject.animate({
				left : 0,
				duration : 120
			});
			$.currentObject = null;
		}
	}
	$.isToggled = false;
};


/**
 * Event listener to close side menu on blocker view on click
 */
$.viewBlocker.addEventListener('singletap', function() {
	$.closeSidebar();
});


/**
 * Event listener to close side menu on blocker view on swipe (left only)
 */
$.viewBlocker.addEventListener('swipe', function(e) {
	//close only on left swipe
	if (e.direction === 'left') {
		$.closeSidebar();
	}
});

