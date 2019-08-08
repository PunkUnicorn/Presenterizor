/*
  Adapted from
  http://github.com/scheib/HTMLMisc/blob/gh-pages/KeyboardState.html and
  http://www.cryer.co.uk/resources/javascript/script20_respond_to_keypress.htm
*/
"use strict";

var SELECT2TIMEOUTms = 3000;
/*
 * Get text content, the desparate methods
 * https://stackoverflow.com/questions/6743912/get-the-pure-text-without-html-element-by-javascript
 */

// jcomeau_ictx's approach:
function get_content(element) {
	try {
		 var html = element.innerHTML;
		 return html.replace(/<[^>]*>/g, "").trim();
	} catch (Ierr) {
		return "";
	}
}
// Gabi's approach
function gabi_content(element) {
	try {
		return (element.innerText || element.textContent).trim();
	} catch (err) {
		return "";
	}
}

var processEnabled = function(sourceElement) {
	var selectors = {};

	//listen for click events and select src element
	try {

		//check if element has an id tag
		if(typeof sourceElement.id != 'unknown' && sourceElement.id){
			setIDSelector(sourceElement, selectors);
		}
		//if no id, generate xpath expression
		else{
			setXPATHSelector(sourceElement, selectors);
		}
	} catch (e) {}

	try
	{
		// generate selection by class
		if(sourceElement.className && sourceElement.className.split(" ").length === 1){
			setClassNameSelector(sourceElement, selectors);
		}
		//generate selection by css selector traits
		setCssSelector(sourceElement, selectors);
	} catch (e) {	}

	try {
		//generate selection by element name
		if(sourceElement.name){
			setNameSelector(sourceElement, selectors);
		}
	} catch (e) { }

	// determine the best selector based on selector rankings
	determineBestSelector(selectors);

	console.log('┍━━━━━━━━━━--');


	console.log('│ ', selectors);
	console.log('│ ',selectors.recommendedSelector);
	console.log('┖━━━━━━━━━━--');
	return selectors;

	// copy find by tag to clipboard
	// CAUSES JUMPING ROUND SCREEN ---> copyToClipboard(selectors.recommendedSelector);
}

var sendKeysCodeSnippet = 'By.$INJECTBYFUNC("$INJECTFUNCPARAM")';
//'{<br />var by = By.$INJECTBYFUNC("$INJECTFUNCPARAM");<br />' +
//'    var element = Driver.FindElement(by);<br />' +
//'    element.SendKeys( "YOURKEYS" );<br />}<br />';

var setIDSelector = function(sourceElement, collector){
	collector.id = {
		selector: sourceElement.id,
		tag: sendKeysCodeSnippet.replace('$INJECTFUNCPARAM', sourceElement.id).replace('$INJECTBYFUNC', 'Id'), //'@FindBy(id="' + sourceElement.id + '")',
		element: document.getElementById(sourceElement.id)
	};

	collector.id.selected = collector.id.element === sourceElement;
}

var setNameSelector = function(sourceElement, collector){
	collector.name = {
		selector: sourceElement.name,
		tag: sendKeysCodeSnippet.replace('$INJECTFUNCPARAM', sourceElement.name).replace('$INJECTBYFUNC', 'Name'), //@FindBy(name="' + sourceElement.name + '")',
		element: document.getElementsByName(sourceElement.name)[0]
	};

	collector.name.selected = collector.name.element === sourceElement;
}

var setXPATHSelector = function(sourceElement, collector){
	var parent;
	var element = sourceElement;
	var xpath = "";
	while(element.id === '' && element.tagName !== 'HTML'){
		parent = element.parentNode;
		var index;
		var counter = 0;
		for(var i = 0; i < parent.children.length; i++){
			if(parent.children[i].tagName === element.tagName){
				counter += 1;
				if(parent.children[i] === element){
					index = counter;
				}
			}
		}
		if(xpath === ""){
			if(counter === 1){
				xpath = element.tagName;
			}else{
				xpath = element.tagName + "["+index+"]";
			}
		}else{
			if(counter === 1){
				xpath = element.tagName + "/" + xpath;
			}else{
				xpath = element.tagName + "["+index+"]" + "/" + xpath;
			}
		}
		element = element.parentNode;
	}
	if(element.tagName === 'HTML'){
		xpath = "html/" + xpath.toLowerCase();
	}else{
		xpath = "//" + element.tagName + "[@id='"+element.id+"']/" + xpath.toLowerCase();
	}
	collector.xpath = {};
	collector.xpath.selector = xpath;
	collector.xpath.tag = sendKeysCodeSnippet.replace('$INJECTFUNCPARAM', xpath).replace('$INJECTBYFUNC', 'XPath');
	//collector.xpath.tag = '@FindBy(xpath="'+ xpath + '")';
	collector.xpath.element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	collector.xpath.selected = collector.xpath.element === sourceElement;
}

var setClassNameSelector = function(sourceElement, collector){
	collector.className = {
		selector: sourceElement.className,
		tag:  sendKeysCodeSnippet.replace('$INJECTFUNCPARAM', sourceElement.className ).replace('$INJECTBYFUNC', 'ClassName'), //'@FindBy(className="'+ sourceElement.className + '")',
		//tag: '@FindBy(className="'+ sourceElement.className + '")',
		element: document.getElementsByClassName(sourceElement.className)[0]
	};

	collector.className.selected = collector.className.element === sourceElement
}

var setCssSelector = function(sourceElement, collector){
	var tagName = sourceElement.tagName;
	var id = sourceElement.id;
	var classNames = sourceElement.className;
	var cssSelector = "";
	if(tagName){
		if(sourceElement.getAttribute("name")){
			cssSelector += tagName.toLowerCase() + "[name='" + sourceElement.getAttribute("name") +"']";
		}else{
			cssSelector += tagName.toLowerCase();
		}
	}
	if(id){
		cssSelector += "#"+id;
	}
	if(classNames){
		var classes = classNames.split(" ");
		classes.forEach(function(name){
			cssSelector += "."+name;
		});
	}
	if(cssSelector !== "" && cssSelector !== tagName.toLowerCase()){
		collector.css = {
			selector: cssSelector,


			tag: sendKeysCodeSnippet.replace('$INJECTFUNCPARAM', cssSelector).replace('$INJECTBYFUNC', 'CssSelector'), //'@FindBy(css="' + cssSelector + '")',
			//tag: '@FindBy(css="' + cssSelector + '")',
			element: document.querySelector(cssSelector)
		};

		collector.css.selected = collector.css.element === sourceElement;
	}
}

var determineBestSelector = function(collector){
	if(collector["id"] && collector["id"].selected){
		collector.recommendedSelector = collector.id.tag;
	}else if(collector["name"] && collector["name"].selected){
		collector.recommendedSelector = collector.name.tag;
	}else if(collector["className"] && collector["className"].selected){
		collector.recommendedSelector = collector.className.tag;
	}else if(collector["css"] && collector["css"].selected){
		collector.recommendedSelector = collector.css.tag;
	}else if(collector["xpath"] && collector["xpath"].selected){
		collector.recommendedSelector = collector.xpath.tag;
	}
}
var copyToClipboard = function(text){
    var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerHTML = text;
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    document.body.removeChild(copyDiv);
    console.log("Tag " + text + " copied to your clipboard.");
}



function GetCodeFor(e)
{
  if ((e.charCode) && (e.keyCode==0))
  {
    return e.charCode;
  } else {
    return e.keyCode;
  }
}
function GetDescriptionFor(e)
{
  var result, code;
  if ((e.charCode) && (e.keyCode==0))
  {
    result = "charCode: " + e.charCode;
    code = e.charCode;
  } else {
    result = "keyCode: " + e.keyCode;
    code = e.keyCode;
  }
  if (code == 8) result += " BKSP";
  else if (code == 9) result += " TAB";
  else if (code == 46) result += " DEL";
  else if ((code >= 41) && (code <=126)) result += " '" + String.fromCharCode(code) + "'";
  if (e.shiftKey) result += " shift";
  if (e.ctrlKey) result += " ctrl";
  if (e.altKey) result += " alt";

  return result;
}

function getSnippet(element, tagName, haveRandom) {
	var tryBlock = '/**********************\r\n'+
'$LOLWUT\r\n'+
'**********************/\r\n'+
'try\r\n'+
'{\r\n'+
'$PROGRESSDESCRIPTION\r\n'+
'$BODY\r\n'+
'}\r\n'+
'catch (Exception e)\r\n'+
'{\r\n'+
'    var argFilename = SaveScreenShot("$ERRORSCREENSHOTFILENAME");\r\n'+
'    progressDescription.AppendLine("Post-mortum screenshot saved as: " + argFilename);\r\n'+
'    throw new Exception(progressDescription.ToString(), e);\r\n'+
'}\r\n';

	var snippet = '    /*$ALTERNATIVEBY*/\r\n' +
'\r\n'+
'    var by = $BY;\r\n'+
'    var element = Driver.FindElement(by);\r\n' +
'    Driver.ScrollIntoView(element);\r\n' +
'    element.SendKeys( $TEXTCONTENT );\r\n';

	var selectSnippet = '    /*$ALTERNATIVEBY*/\r\n' +
'\r\n'+
'    var by = $BY;\r\n'+
'    var selectElement = Driver.FindElement(by);\r\n' +
'    Driver.ScrollIntoView(selectElement);\r\n' +
'    var selector = new OpenQA.Selenium.Support.UI.SelectElement(selectElement);\r\n' +
'    Driver.WaitForPageToLoad();\r\n' +
'    selector.SelectByValue( $TEXTCONTENT );';

	var aSnippet = '    /*$ALTERNATIVEBY*/\r\n' +
'\r\n'+
'    var by = $BY;\r\n'+
'    var element = Driver.FindElement(by);\r\n' +
'    Driver.ScrollIntoView(element);\r\n' +
'    element.Click();\r\n' +
'    Driver.WaitForPageToLoad();\r\n';

	console.log(tagName, " getSnippet()");
	switch (tagName) {
		case "SELECT":
			return tryBlock.replace('$BODY', selectSnippet);
		case 'LABEL':
		case "A":
		case "I":
			return tryBlock.replace('$BODY', aSnippet);
		case "INPUT":
			switch (element.getAttribute('type')) {
				case 'checkbox':
				case 'submit':
					return tryBlock.replace('$BODY', aSnippet);
				default:
					//FALL THROUGH....
			}
			//FALL THROUGH LIKE ALICE IN WONDERLAND
		default:
				return tryBlock.replace('$BODY', snippet);
	}
}

function getAssociatedLabel(element){
	var previousNode = {};
	var candidate = '';
	try {
		console.log('element.parentNode.previousElementSibling:', element.parentNode.previousElementSibling);
		var possibleLabel = element.parentNode.previousElementSibling;
		console.log('-------------->', gabi_content(possibleLabel));
		if (possibleLabel != null) {
			candidate = get_content(possibleLabel) || gabi_content(possibleLabel);
		} else { throw "LOOK AGAIN"; }
	} catch (err) {
		console.log(err);
		try {
			console.log('element.parentNode.parentNode:', element.parentNode.parentNode);
			console.log('element.parentNode.parentNode.previousElementSibling:', element.parentNode.parentNode.previousElementSibling);
			console.log(gabi_content(element.parentNode.parentNode.previousElementSibling));
			var anotherPossibleLabel = element.parentNode.parentNode.previousElementSibling;
			candidate = gabi_content(anotherPossibleLabel);
		} catch(err_again) { console.log(err_again); }
	}
	return candidate;
}

function getPlaceholderlaceHolderText(element) {
	return element.getAttribute('placeholder');
}

function clean(obj) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] == '') {
      delete obj[propName];
    }
  }
	return obj;
}

function getProgressDescription(obj) {
	return '    progressDescription.AppendLine("' + JSON.stringify(obj).split('"').join("'") + '");';
}

function  getErrorScreenshotFilename() {
	return "ARRGGGHHHHHH.jpg";
}

function makeInputCodeSnippet(element, selectors, txt) {
	var alternativeBy = [];
	if(selectors["id"] && selectors["id"].selected){
		alternativeBy.push(selectors.id.tag);
	}
	if(selectors["name"] && selectors["name"].selected){
		alternativeBy.push(selectors.name.tag);
	}
	if(selectors["className"] && selectors["className"].selected){
		alternativeBy.push(selectors.className.tag);
	}
	if(selectors["css"] && selectors["css"].selected){
		alternativeBy.push(selectors.css.tag);
	}
	if(selectors["xpath"] && selectors["xpath"].selected){
		alternativeBy.push(selectors.xpath.tag);
	}
	
	var haveRandom = false;
	var randomToken = "$RANDOM";
	var indexOfRandom = txt.indexOf(randomToken);
	if (indexOfRandom != -1) {
		haveRandom = true;		
	}
	
	var label = getAssociatedLabel(element);
	if (label && label != null) {
		label = label.substring(0, 23);
	}
	var placeholderText =  getPlaceholderlaceHolderText(element);
	if (placeholderText != null) {
		placeholderText = placeholderText.substring(0, 23);
	}

	var selection = (element.selectedIndex && element.selectedIndex != -1) ? element.options[element.selectedIndex].text : "";
	var errorScreenshotFilename = getErrorScreenshotFilename();
	console.log(element.tagName);
	var cleanResult = clean({
		"placeholder": placeholderText,
		"label": label,
		"text:": element.text || (get_content(element) || gabi_content(element)).toString().substring(0, 23),
		"selection": selection,
		"tagName": element.tagName,
		"value":element.value,
		"id": element.id,
		"class": element.className.replace('nosymbols', '') 
	});
	var progressDescription = getProgressDescription(cleanResult);
	var headerValue
		= JSON.stringify(cleanResult)
			.split(',').join(',\r\n')
			.split('"').join('')
			.split('{').join('')
			.split('}').join('');
  var needDelay = false;
	if (txt.length == 1) {
		needDelay = true; //one character at a time input, then delay... used for the select2 popup triggering.
	}
	var alternativeByStr = alternativeBy.join("\r\n    ");
	var byVal = selectors.recommendedSelector;
	var textContent = haveRandom ? 'RandomSwap("'+txt+'")' : '"' + txt + '"';
	var delayCode = "\r\n    Thread.Sleep("+SELECT2TIMEOUTms.toString()+");\r\n";
	var snippet = getSnippet(element, element.tagName, haveRandom)
  	.replace("$PROGRESSDESCRIPTION", progressDescription)
		.replace("$ERRORSCREENSHOTFILENAME", errorScreenshotFilename)
		.replace("$ALTERNATIVEBY", alternativeByStr)
		.replace("$BY", byVal)
		.replace("$TEXTCONTENT", textContent)
		.replace("$LOLWUT", headerValue);

	console.log(snippet);
	return snippet + ( needDelay ? delayCode : "" );
}

function unwatchElement(element, selectors, overrideVal) {
	element.removeEventListener("blur", MonitorElementBlur);
	var txt = element.getAttribute("data-codey-ghost");
	element.removeAttribute('data-codey-ghost');
	if (txt == null) txt = '';
	console.log(txt + '<<<<<==========================================<<<<<<<<<<<<<=============');

	// if (element.classList.contains('datepicker')) {
	// 	//var dp = $(element).datepicker;
	// 	console.log("element.value", element.value);
	// 	var vally = window.document.getElementById(element.id).value;
	// }

	console.log(element.value || gabi_content(element));
	txt = element.value || gabi_content(element) || txt;
	if (typeof overrideVal != "undefined") {
		txt = overrideVal;
	}

  // var randomToken = "$RANDOM";
	// var indexOfRandom = txt.indexOf(randomToken);
	// if (indexOfRandom != -1) {
		// var ourTokenPart = txt.split(randomToken).slice(1)[0].split()[0];
		// console.log(ourTokenPart, "<<<<<<~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~<<<<<<~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
		// var fullToken = randomToken+ourTokenPart;
		// var newValue = makeRandom(5) + ourTokenPart;
		// txt = txt.replace(fullToken, newValue);
	// }

	chrome.storage.local.get('codyGhostCode', function(value) {
		var newValue = value.codyGhostCode + '\r\n\r\n' + makeInputCodeSnippet(element, selectors, txt);
		chrome.storage.local.set({'codyGhostCode': newValue}, function() {console.log('newValue:', newValue);});
  });

}
function watchElement(element, key){
	element.addEventListener("blur", MonitorElementBlur);
	var txt = element.getAttribute("data-codey-ghost");
	if (txt == null) txt = '';
	txt += key;
	return txt;
}

function MonitorKeyDown(e)
{
  //if (!e) e=window.event;
  //var d = GetDescriptionFor(e);
  //console.log(d);
  return false;
}
function MonitorKeyUp(e)
{
  //if (!e) e=window.event;
  //var d = GetDescriptionFor(e);
  //console.log(d);
  return false;
}
function MonitorKeyPress(e)
{
  if (!e) e=window.event;
  //var d = GetDescriptionFor(e);
  //console.log(d);
  console.log(e.key);
  chrome.storage.sync.get("enabled", function(value){
		if(value.enabled){
			var txt = watchElement(e.target, e.key);
			e.target.setAttribute("data-codey-ghost", txt);
			if (e.target.classList.contains('search-spinner')) { //select2 always do a sendkeys for each keypress
				var selectors = processEnabled(e.target);
				var untxt = unwatchElement(e.target, selectors, e.key);
				chrome.storage.local.set({'codyGhostCode': untxt}, function() {});
			}
			console.log(txt);
	}
	});
  return false;
}
function MonitorBlur()
{
  console.log('blurr');
}
function MonitorFocus()
{
  console.log("focus");
}
function MonitorElementBlur(e)
{
  if (!e) e=window.event;
  chrome.storage.sync.get("enabled", function(value){
  		if(value.enabled){
        console.log('element blur ' + e.target.id);
  			var selectors = processEnabled(e.target);
				var txt = unwatchElement(e.target, selectors);
				chrome.storage.local.set({'codyGhostCode': txt}, function() {});

				//// HOOF IN SUPPORT FOR DYMAMIC HTML
				//UnRegisterEventListeners();
				//RegisterEventListeners();
  		}
  });
  console.log('element blur ' + e.target.id);
}
function MonitorElementFocus(e)
{
  if (!e) e=window.event;
  chrome.storage.sync.get("enabled", function(value){
  		if(value.enabled){
				// HOOF IN SUPPORT FOR DYMAMIC HTML
        console.log('element focus ' + e.target.id);
  			var selectors = processEnabled(e.target);
				var txt = watchElement(e.target, selectors);

				//UnRegisterEventListeners();
				//RegisterEventListeners();
  		}
  });
  console.log('element blur ' + e.target.id);
}
// function MonitorMouseDown(e)
// //function MonitorMouseMove(e)
// {
//   if (!e) e=window.event;
//   chrome.storage.sync.get("enabled", function(value){
//   		if(value.enabled){
//
//   			var selectors = processEnabled(e.target);
// 				var txt = watchElement(e.target, 'mouse down');
// 				var txt = unwatchElement(e.target, selectors);
// 				chrome.storage.local.set({'codyGhostCode': txt}, function() {});
//
//   		}
//   });
//   console.log("mouse down");
//   return false;
// }
function MonitorClick(e)
{
  if (!e) e=window.event;
	console.log('monitor click: tagName=', e.target.tagName);

	e.target.focus();

	chrome.storage.sync.get("enabled", function(value){
		if(value.enabled){
			switch (e.target.tagName) {
				case 'SELECT':
  				var selectors = processEnabled(e.target);
					var txt = unwatchElement(e.target, selectors);
					chrome.storage.local.set({'codyGhostCode': txt}, function() {});
					break;
				case 'LABEL':
				case 'I':
				case "A":
					//setTimeout(function() {
					//					var selectors = processEnabled(e.target);
					//					var txt = unwatchElement(e.target, selectors);
					//					chrome.storage.local.set({'codyGhostCode': txt}, function() {});
					//				}, SELECT2TIMEOUTms);
					var selectors = processEnabled(e.target);
					var txt = unwatchElement(e.target, selectors);
					chrome.storage.local.set({'codyGhostCode': txt}, function() {});
					break;
				case 'INPUT':
					var fallthrough = true;
					//if (e.target.getAttribute('type') == 'submit') {
					switch (e.target.getAttribute('type')) {
						case 'checkbox':
						case 'submit':
							var selectors = processEnabled(e.target);
							var txt = unwatchElement(e.target, selectors);
							chrome.storage.local.set({'codyGhostCode': txt}, function() {});
							fallthrough = false;
							break;
						default:
							fallthrough = true;
							break;
					}
					if (!fallthrough) break;
					//FALL THROUGH IF NOT SUBMIT OR CHECKBOX BUTTON!!!
				default:
			}
		} else {
			var txt = watchElement(e.target, 'mouse click');
		}
	});
  return false;
}
// function MonitorWindowHashChange(e) {
// 	var oldURL = e.oldURL;
// 	var newURL = e.newURL;
// 	if (oldURL == newURL) {
// 		return false;
// 	}
// 	var selectors = processEnabled(e.target);
// 	//var txt = watchElement(e.target, 'mouse click');
// 	var txt = unwatchElement(e.target, selectors);
// 	chrome.storage.local.set({'codyGhostCode': txt}, function() {});
// }
// function MonitorMouseMove(e)
// {
//   if (!e) e=window.event;
//
// 	chrome.storage.sync.get("enabled", function(value){
// 		if(value.enabled){
// 			if (e.buttons == 1 || e.buttons == 2)
// 			{
// 				console.log('get mousemove click and do somthing with it');
//   			var selectors = processEnabled(e.target);
// 				var txt = watchElement(e.target, 'mouse down');
// 				var txt = unwatchElement(e.target, selectors);
// 				chrome.storage.local.set({'codyGhostCode': txt}, function() {});
// 			}
// 		}
// 	});
//
// 	if (e.altKey) {
// 		console.log(e.target.tagName);
// 		console.log(e.target.value || gabi_content(e.target));
// 	}
//   return false;
// }
function UnRegisterEventListeners()
{
  document.removeEventListener('keydown', MonitorKeyDown);
  document.removeEventListener('keyup', MonitorKeyUp);
  document.removeEventListener('keypress', MonitorKeyPress);
  //document.removeEventListener('mousedown', MonitorMouseDown);
  //document.removeEventListener('mousemove', MonitorMouseMove);
	document.removeEventListener('click', MonitorClick);
	document.removeEventListener('focus', MonitorElementFocus);
}
function RegisterEventListeners()
{
  document.addEventListener('keydown', MonitorKeyDown, false);
  document.addEventListener('keyup', MonitorKeyUp, false);
  document.addEventListener('keypress', MonitorKeyPress, false);
  //document.addEventListener('mousedown', MonitorMouseDown, false);
  //document.addEventListener('mousemove', MonitorMouseMove, false);
	document.addEventListener('click', MonitorClick, false);
	document.addEventListener('focus', MonitorElementFocus, false);
}
RegisterEventListeners();

//let this snippet run before your hashchange event binding code
// if(!window.HashChangeEvent)(function(){
// 	var lastURL=document.URL;
// 	window.addEventListener("hashchange",function(event){
// 		Object.defineProperty(event,"oldURL",{enumerable:true,configurable:true,value:lastURL});
// 		Object.defineProperty(event,"newURL",{enumerable:true,configurable:true,value:document.URL});
// 		lastURL=document.URL;
// 	});
// }());
//window.addEventListener("hashchange", MonitorWindowHashChange, false);


document.body.onblur = MonitorBlur;
document.body.onfocus = MonitorFocus;

//https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
//document.addEventListener('on', RegisterEventListeners, false);


// // Select the node that will be observed for mutations
// var targetNode = document.getElementsByTagName('body')[0];
//
// // Options for the observer (which mutations to observe)
// var config = { attributes: false, childList: true, subtree: true };
//
// // Callback function to execute when mutations are observed
// var mutationObserverCallback = function(mutationsList) {
// 		console.log('mutations');
//     for(var mutation of mutationsList) {
//         if (mutation.type == 'childList') {
//             console.log('A child node has been added or removed.');
//         }
//         else if (mutation.type == 'attributes') {
//             console.log('The ' + mutation.attributeName + ' attribute was modified.');
//         }
//     }
// };
//
// // Create an observer instance linked to the callback function
// var observer = new MutationObserver(mutationObserverCallback);
//
// // Start observing the target node for configured mutations
// observer.observe(targetNode, config);
//
// // Later, you can stop observing
// observer.disconnect();