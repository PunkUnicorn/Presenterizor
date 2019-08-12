
// initialize icon image
if(chrome.storage){
	chrome.storage.local.get({'presenterizorActivated': false, 'presenterizorIntervalId':-1, 'presenterizorCurrentTab':0 }, function(value){
		var path = "icon.png";
		if(value.presenterizorActivated){
			path = "icon-on.png";
		}
		chrome.browserAction.setIcon({path: path});
	});
}


//https://developer.chrome.com/extensions/messaging


//{'value': theValue}
//if (chrome.browserAction) {
	//listen for clicks to turn extension on and off / sets boolean in chrome storage
	chrome.browserAction.onClicked.addListener(function(tab){
		
		chrome.storage.local.get(["presenterizorActivated", "presenterizorIntervalId", "presenterizorCurrentTab","presenterizorInterval"], function(value){
			
				var presenterizorActivated = !value.presenterizorActivated;
				
				if (value.presenterizorIntervalId != -1) {
					clearInterval(value.presenterizorIntervalId);					
				}
				
				if (presenterizorActivated) {
					
					if (typeof value.presenterizorInterval == 'undefined') {
						value.presenterizorInterval = 6000;
					}
					
					var newIntervalId = setInterval(function() {
																		
						chrome.storage.local.get("presenterizorCurrentTab", function (timerValue) {
							
							if (typeof timerValue.presenterizorCurrentTab == "undefined") {
								timerValue.presenterizorCurrentTab = -1;
							}
							
							var presenterizorCurrentTab = timerValue.presenterizorCurrentTab + 1;
							
							
							chrome.tabs.query({currentWindow: true}, function(tabarray) {
							
								if (presenterizorCurrentTab >= tabarray.length) {
									presenterizorCurrentTab = 0;
								}
								console.log(presenterizorCurrentTab);
								
								chrome.tabs.highlight({'tabs':presenterizorCurrentTab}, function (tabs) { });

								//chrome.windows.getCurrent({'populate':true}, function (window) { console.log(window); } );
								
								//https://stackoverflow.com/questions/1125084/how-to-make-the-window-full-screen-with-javascript-stretching-all-over-the-scre
								
								
								// var scrollOptions = {
									// //left: 0,
									// top: 200,
									// behavior: 'auto' // or 'smooth'
								// }  
								
								//chrome.tabs.executeScript({
								//	code: 'window.scrollTo(' + JSON.stringify(scrollOptions) + ')'
								//});

								
								
								var d = new Date();
								
								console.log('YEAH ' + d.toLocaleTimeString());
								chrome.storage.local.set({"presenterizorCurrentTab":presenterizorCurrentTab}, function(){ });
							})								
						});						
						
					}, value.presenterizorInterval);							
				}
				else {
					
					newIntervalId = -1;
					
				}
				
				chrome.storage.local.set({"presenterizorActivated": presenterizorActivated, "presenterizorIntervalId":newIntervalId},
				
					function(){
						
						var path = "icon.png";
						
						if(presenterizorActivated){
							
							path = "icon-on.png";
							
						}
						
						chrome.browserAction.setIcon({path: path});												
					});
		});
	});

	
//}
/* chrome.app.runtime.onLaunched.addListener(function() {
  // Center window on screen.
  var screenWidth = screen.availWidth;
  var screenHeight = screen.availHeight;

  var b = {
      width: Math.round(screenWidth * 2/4),
      height: Math.round(screenHeight * 2/4),
      left: Math.round(screenWidth * 1/4),
      top: Math.round(screenHeight * 1/4)
    };

  chrome.app.window.create('window.html', {
    id: "keyboardWinID",
    outerBounds: b
  });
});
 */
