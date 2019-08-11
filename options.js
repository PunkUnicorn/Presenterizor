// Saves options to chrome.storage
function save_options() {
  var interval = document.getElementById('interval').value;
	
	console.log(interval);
	
  chrome.storage.local.set({
    presenterizorInterval: parseInt(interval)*1000
  }, function() {});
}

chrome.storage.local.get("presenterizorInterval", function(value) {
	if (typeof value.presenterizorInterval == 'undefined') {
		value.presenterizorInterval = 6000;
	}
	console.log(value);
	document.getElementById('interval').value = parseInt(parseInt(value.presenterizorInterval) / 1000);
});
document.getElementById('save').addEventListener('click', save_options);