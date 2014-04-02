/**
 * # The home content controller
 * @class Controllers.home 
 */


/**
 * If ios7, set window top property as 20
 */
if(OS_IOS){
	if(Alloy.Globals.iOS7){
		$.win.setTop(20);
	}
}