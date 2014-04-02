/**
 * # The sidebar content UI controller
 * 
 *  Side bar menu content is added here.
 * 
 * @class Controllers.UI.sidebarcontent
 * @uses core
 */

var App = require("core");


//some dummy data for our table view
var tableData = [{
	title : 'Apples',
	price : '1.25',
	hasChild : true
}, {
	title : 'Grapes',
	price : '1.50',
	hasChild : true
}, {
	title : 'Oranges',
	price : '2.50',
	hasChild : true
}, {
	title : 'Bananas',
	price : '1.50',
	hasChild : true
}, {
	title : 'Pears',
	price : '1.40',
	hasChild : true
}, {
	title : 'Kiwis',
	price : '1.00',
	hasChild : true
}];

/**
 * Set the table content into table
 */
$.menu.setData(tableData);

/**
 * Event Listener to open home screen
 * @param {Object} e
 */
function openHomeScreen(e) {
	// open home screen	
	App.openHomeScreen();
	// close the sidebar	
	var sidebar = (OS_IOS) ? App.Sidebar : App.HomeController.sidebar;
	sidebar.closeSidebar();	
};


/**
 * Event Listener to open menu's detail screen
 * @param {Object} e
 */
function openDetailScreen(_event){	
	App.openScreen('ui/menuScreen', true, {
		title: _event.rowData.title,		
		name : _event.rowData.title,
		price : _event.rowData.price		
	});
	// close the sidebar
	var sidebar = (OS_IOS) ? App.Sidebar : App.HomeController.sidebar;
	sidebar.closeSidebar();
};

