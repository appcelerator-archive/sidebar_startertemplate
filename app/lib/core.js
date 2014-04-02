/**
 * The main app singleton used throughout the app.  This singleton
 * can manage your navigation flow, special events that happen throughout
 * the app lifecycle, etc.
 *
 * It's important to understand that this should mainly be a simple app singleton
 * for managing global things throughout your app.  i.e. If you want to sanitize
 * some html, you shouldn't put a function to handle that here.
 *
 * @class core
 * @singleton
 */
var Alloy = require("alloy");

var App = {
	/**
	 * Root Controller reference
	 */
	RootController : {},
	/**
	 * Home Controller reference
	 */
	HomeController : {},
	/**
	 * Device information, some come from the Ti API calls and can be referenced
	 * from here so multiple bridge calls aren't necessary, others generated here
	 * for ease of calculations and such.
	 *
	 * @type {Object}
	 * @param {String} osname The OS of the device
	 * @param {String} version The version of the OS
	 * @param {Number} versionMajor The major version of the OS
	 * @param {Number} versionMinor The minor version of the OS
	 * @param {Number} width The width of the device screen
	 * @param {Number} height The height of the device screen
	 * @param {Number} dpi The DPI of the device screen
	 * @param {String} orientation The device orientation, either "landscape" or "portrait"
	 * @param {String} statusBarOrientation A Ti.UI orientation value
	 */
	Device : {
		osname : Ti.Platform.osname,
		version : Ti.Platform.version,
		versionMajor : parseInt(Ti.Platform.version.split(".")[0], 10),
		versionMinor : parseInt(Ti.Platform.version.split(".")[1], 10),
		width : null,
		height : null,
		dpi : Ti.Platform.displayCaps.dpi,
		orientation : Ti.Gesture.orientation == Ti.UI.LANDSCAPE_LEFT || Ti.Gesture.orientation == Ti.UI.LANDSCAPE_RIGHT ? "landscape" : "portrait"
	},
	/**
	 * Checking wether the device is a tablet or handheld phone.
	 * NOTE:considering tablets to have width over 720px and height over 600px - you can define your own
	 */
	isTablet : function() {
		switch (App.Device.osname) {
			case 'ipad':
				return true;
			case 'mobileweb':
				return false;
			case 'android':
				var psc = Ti.Platform.Android.physicalSizeCategory;
				var tiAndroid = Ti.Platform.Android;
				return psc === tiAndroid.PHYSICAL_SIZE_CATEGORY_LARGE || psc === tiAndroid.PHYSICAL_SIZE_CATEGORY_XLARGE;
			default:
				return Math.min(Ti.Platform.displayCaps.platformHeight, Ti.Platform.displayCaps.platformWidth) >= 400;
		};
	},
	/**
	 * Sets up the app singleton and all it's child dependencies.
	 * **NOTE: This should only be fired in index controller file and only once.**
	 */
	init : function() {
		// Global system Events
		Ti.Network.addEventListener("change", App.networkChange);
		Ti.App.addEventListener("pause", App.exit);
		Ti.App.addEventListener("close", App.exit);
		Ti.App.addEventListener("resumed", App.resume);
		Ti.Gesture.addEventListener("orientationchange", App.orientationChange);

		if (OS_ANDROID) {
			Ti.Android.currentActivity.addEventListener("resume", App.resume);
		}

		// Get device dimensions
		App.getDeviceDimensions();

		// Render the root controller as the first screen that comes up
		App.RootController = Alloy.createController("root");

		// Setup specific, globally accessible pieces in the App singleton
		if (OS_IOS || OS_MOBILEWEB) {
			App.NavGroup = App.RootController.navgroup; // store the reference to follow terminology (open windows from navigation group)
			App.GlobalWindow = App.RootController.navgroup; // store the reference to follow terminology (for performing tasks: like event handling/ animation)
		}
		
		// To use singleton framework, add sidebar reference only once for ios
		if (OS_IOS){
			App.Sidebar = Alloy.createController("ui/sidebar");
			App.Sidebar.sidenavgroup.open();						
			App.Sidebar.wrapper.add(App.Sidebar.containerView);
		}
		
		// Store home controller reference and bind the side bar touch events
		App.HomeController = App.RootController.contentController;
		App.bindSidebarEvents(App.HomeController);
		
		// Open the initial window
		if (OS_IOS) {
			App.NavGroup.open();
			App.NavGroup.openWindow(App.HomeController.win);
		} else if (OS_MOBILEWEB) {			
			//Opening the window as per mobileWeb specification			
			App.RootController.win.open();			
			App.NavGroup.open(App.HomeController.win);
		} else {	
			//Opening the window as per android specification			
			App.HomeController.win.open();
		}

	},	
	/**
	 * Registers the event listeners for Side bar
	 * 
	 * 
	 * On ** Android, MobileWeb**, Side bar can be added to
	 * multiple controller's screen. Hence controller reference
	 * is needed to open and close it.
	 * 
	 * On ** iOS **, Sidebar reference is directly accessible via {@link core#Sidebar}
	 * 
	 *  @param {Controllers/Object} _controller optional
	 */
	bindSidebarEvents : function(_controller) {
		// Click / toggle handler
		var toggle = function() {
			if (!App.isTopMenuOpen) {
				var isToggled = (OS_IOS) ? App.Sidebar.isToggled : _controller.sidebar.isToggled;
				var reference = (OS_IOS) ? App.Sidebar : _controller.sidebar;
				if (isToggled) {
					reference.closeSidebar(_controller.winWrapper);
				} else {
					reference.openSidebar(_controller.winWrapper);

				}
			}
		};

		// Swipe / toggle handler
		var checkDirection = function(e) {
			// for right direction only, toggle
			if (e.direction === 'right') {
				toggle();
			}
		};
		
		// register click and swipe events on nav bar button  
		_controller.navBar.sidebarBtn.addEventListener("click", toggle);
		_controller.navBar.sidebarBtn.addEventListener("swipe", toggle);
		
		// for ios, register events on global window reference 
		// else, register on referenced controller window
		if (OS_IOS) {
			App.GlobalWindow.addEventListener("swipe", checkDirection);
		} else {
			_controller.win.addEventListener("swipe", checkDirection);
		}
	},
	/**
	 * This function is used in home screen navigation from sidebar
	 * 
	 * NOTE: Top level opened view is removed from home screen's wrapper  
	 */
	openHomeScreen : function() {
		if (App.HomeController.winContent.children.length > 1) {
			App.HomeController.winContent.remove(App.HomeController.winContent.children[1]);
		}
		// set the nav bar title to default
		App.HomeController.navBar.title.text = 'SideBar';

	},

	/**
	 * Handle cross platform way of opening a main screen.
	 *
	 * See example:
	 *
	 * 		var login = Alloy.createController("login");
	 * 		App.openScreen(login);
	 *
	 * or if you don't need the controller reference:
	 *
	 * 		App.openScreen("login");
	 *
	 * NOTE: "_isMenuItem" flag is used to handle top level controllers 
	 * (e.g. items from the sidebar menu that don't drill down in the navgroup)
	 * 
	 * NOTE: Top level screens (from Side bar) are opened at the top of the home screen
	 * and previous opened screen is removed from home controller wrapper
	 * 
	 * More could be added here depending on the navigation requirements.
	 *
	 * @param {Controllers/String} _controller
	 *  @param {__isMenuItem/Boolean} the menu flag
	 * @param {Object} _controllerArguments The arguments for the controller (optional)	 
	 */	
	openScreen : function(_controller, _isMenuItem, _controllerArguments) {

		var controller = null;
		if ( typeof _controller === "string") {
			controller = Alloy.createController(_controller, _controllerArguments);
		} else {
			controller = _controller;
		}

		// Open top level screen from the sidebar menu
		if (_isMenuItem) {
			// remove the previous opened screen
			if (App.HomeController.winContent.children.length > 1) {
				App.HomeController.winContent.remove(App.HomeController.winContent.children[1]);
			}
			App.HomeController.navBar.title.text = _controllerArguments.title || _controller;
			// add new navigation screen
			App.HomeController.winContent.add(controller.getView());
		} else {			
			// add the code to navigate the child screens of home controller  
		}

	},
	/**
	 * Helper to bind the orientation events to a controller. These get added automatically
	 * for every controller opened via {@link core#openScreen} which have a public `handleOrientation` method.
	 *
	 * **NOTE** It is VERY important this is
	 * managed right because we're adding global events. They must be removed
	 * or a leak can happen because of all the closures. We could slightly
	 * reduce the closures if we placed these in the individual controllers
	 * but then we're duplicating code. This keeps the controllers clean. Currently,
	 * this method will _add_ and _remove_ the global events, so things should go
	 * out of scope and GC'd correctly.
	 *
	 * @param {Controllers} _controller The controller to bind the orientation events
	 */
	bindOrientationEvents : function(_controller) {
		_controller.window.addEventListener("close", function() {
			if (_controller.handleOrientation) {
				Ti.App.removeEventListener("orientationChange", _controller.handleOrientation);
			}
		});

		_controller.window.addEventListener("open", function() {
			Ti.App.addEventListener("orientationChange", function(_event) {
				if (_controller.handleOrientation) {
					_controller.handleOrientation(_event);
				}

				App.setViewsForOrientation(_controller);
			});
		});
	},
	/**
	 * Update views for current orientation helper
	 *
	 * We're doing this because Alloy does not have support for
	 * orientation support in tss files yet. In order not to duplicate
	 * a ton of object properties, hardcode them, etc. we're using this method.
	 *
	 * Once Alloy has orientation support (e.g. `#myElement[orientation=landscape]`), this
	 * can be removed and the tss reworked.
	 *
	 * All that has to be done is implement the following structure in a `.tss` file:
	 * 		"#myElement": {
	 * 			landscape: { backgroundColor: "red" },
	 * 			portrait: { backgroundColor: "green" }
	 * 		}
	 *
	 * @param {Controllers} _controller
	 */
	setViewsForOrientation : function(_controller) {
		if (!App.Device.orientation) {
			return;
		}

		// Restricted the UI for portrait and landscape orientation
		if (App.Device.orientation == "portrait" || App.Device.orientation == "landscape") {
			for (var view in _controller.__views) {
				if (_controller.__views[view][App.Device.orientation] && typeof _controller.__views[view].applyProperties == "function") {
					_controller.__views[view].applyProperties(_controller.__views[view][App.Device.orientation]);
				} else if (_controller.__views[view].wrapper && _controller.__views[view].wrapper[App.Device.orientation] && typeof _controller.__views[view].applyProperties == "function") {
					_controller.__views[view].applyProperties(_controller.__views[view].wrapper[App.Device.orientation]);
				}
			}
		}
	},
	/**
	 * Global network event handler
	 * @param {Object} _event Standard Ti callback
	 */
	networkChange : function(_event) {

	},
	/**
	 * Exit event observer
	 * @param {Object} _event Standard Ti callback
	 */
	exit : function(_event) {

	},
	/**
	 * Resume event observer
	 * @param {Object} _event Standard Ti callback
	 */
	resume : function(_event) {

	},
	/**
	 * Handle the orientation change event callback
	 * @param {Object} _event Standard Ti Callback
	 */
	orientationChange : function(_event) {
		// Ignore face-up, face-down and unknown orientation
		if (_event.orientation === Titanium.UI.FACE_UP || _event.orientation === Titanium.UI.FACE_DOWN || _event.orientation === Titanium.UI.UNKNOWN) {
			return;
		}

		App.Device.orientation = _event.source.isLandscape() ? "landscape" : "portrait";

		/**
		 * Fires an event for orientation change handling throughout the app
		 * @event orientationChange
		 */
		Ti.App.fireEvent("orientationChange", {
			orientation : App.Device.orientation
		});
	},
	/**
	 * Determines the device dimensions
	 * @return {Object} Returns the new values of the new {@link core.Device.width} & {@link core.Device.height} settings
	 */
	getDeviceDimensions : function() {
		// Set device height and width based on orientation
		switch(App.Device.orientation) {
			case "portrait":
				App.Device.width = Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformHeight : Ti.Platform.displayCaps.platformWidth;
				App.Device.height = Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformWidth : Ti.Platform.displayCaps.platformHeight;
				break;
			case "landscape":
				App.Device.width = Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformWidth : Ti.Platform.displayCaps.platformHeight;
				App.Device.height = Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformHeight : Ti.Platform.displayCaps.platformWidth;
				break;
		}

		// Convert dimensions from DP to PX for Android
		if (OS_ANDROID) {
			App.Device.width = (App.Device.width / (App.Device.dpi / 160));
			App.Device.height = (App.Device.height / (App.Device.dpi / 160));
		}

		return {
			width : App.Device.width,
			height : App.Device.height
		};
	}
};

module.exports = App; 