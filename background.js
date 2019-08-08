
// initialize icon image
if(chrome.storage){
	chrome.storage.local.get("{'presenterizorActivated': false, 'presenterizorIntervalId':-1}", function(value){
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
		
		chrome.storage.local.get(["presenterizorActivated", "presenterizorIntervalId"], function(value){
			
				var presenterizorActivated = !value.presenterizorActivated;
				
				if (value.presenterizorIntervalId != -1) {
					clearInterval(value.presenterizorIntervalId);					
				}
				
				if (presenterizorActivated) {
					
					var newIntervalId = setInterval(function() {
						
						chrome.tabs.highlight({tabs:1}, function (tabs) { console.log(tabs); });
						
						chrome.windows.getCurrent({'populate':true}, function (window) { console.log(window); } );
						
						var scrollOptions = {
							//left: leftInput.value,
							top: 200,
							behavior: 'auto' // or 'smooth'
						}  
						
						chrome.tabs.executeScript({
							//							code: 'window.scrollTo({' + JSON.stringify(scrollOptions) + '})'

							code: 'window.scrollTo(' + JSON.stringify(scrollOptions) + ')'
						});
						
						var d = new Date();
						
						console.log('YEAH ' + d.toLocaleTimeString());
						
					}, 1000);							
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