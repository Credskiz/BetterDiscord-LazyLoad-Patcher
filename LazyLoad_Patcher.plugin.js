//META{"name":"lazyload_patcher"}*//

//jshint esversion: 6


var lazyload_patcher = function() {
	this.pluginName = 'LazyLoad Patcher';

	this.getName = 			function()	{return this.pluginName;};
	this.getDescription = 	function()	{return 'LazyLoad Patcher - Patches Discord\'s lazy loading to allow for themes that modify channel and section heights. Credits to noodlebox#0155, Mydayyy#0344 and Kakkela#6315';};
	this.getVersion = 		function()	{return '1.3.0.1';};
	this.getAuthor = 		function()	{return 'HoLLy#2750';};

	const getInternalInstance = e => e[Object.keys(e).find(k => k.startsWith("__reactInternalInstance"))];
	const getEventHandlers = e => e[Object.keys(e).find(k => k.startsWith("__reactEventHandlers"))];
			
	const oldEdgeCaseSize = 16;
	const oldChannelSize = 34;
	const oldSectionSize = 48;
	const oldVoiceUserSize = 28;
	const oldVoiceBottomPaddingSize = 8;
	
	var newEdgeCaseSize = 16; // Done
	var newSectionSize = 20;
	var newChannelSize = 20;
	var newVoiceUserSize = 20;
	var newVoiceBottomPaddingSize = 0;
	
	var originalGetRowHeight;
	var originalGetSectionHeight;
		
	var wasInFriends = 0;
	
	this.load = function()	{
		this.Log("Loaded");
	};
	
	this.start = function() {
		this.Log("Started");
		//if we start up to the friends page, channels won't be loaded
		if (location.pathname.startsWith('/channels/@me')) {

			//so, we run our patching code once, when we click a guild icon
			$('.guild').has('.avatar-small').on('click.llpPatcher', () => {

				//run after 1000ms, to make sure it is loaded
				setTimeout(() => this.updateVariables(), 5000);
				setTimeout(() => this.doChatPatch(), 5000);
				$('.guild').off('click.llpPatcher');
			});
		} else {
			setTimeout(() => this.updateVariables(), 5000);
			setTimeout(() => this.doChatPatch(), 5000);
		}
	};

	this.stop = function()	{ 	this.Log("Stopped");	};
	this.unload = function(){	this.Log("Unloaded");	};

	this.onMessage = function() {};
	
	this.onSwitch = function()  {
		this.updateVariables();
		// If in friends.
		if (location.pathname.startsWith('/channels/@me')) {
			wasInFriends = 1;
		}
		// Else in channels.
		else {
			// Only run patch once every time you go from friends to channels I think.
			if ($('.containerDefault-1bbItS').height() == null && wasInFriends > 0 ) {
				setTimeout(() => this.doChatPatch(), 1000);
				wasInFriends = 1;
			} else if ($('.containerDefault-1bbItS').height() !== null && wasInFriends > 0 ) {
				setTimeout(() => this.doChatPatch(), 1000);
				wasInFriends = 0;
			}
		}
	};
	
	this.observer = function(e) {};

	this.getSettingsPanel = function () {};

	this.Log = function(msg, method = "log") {
		console[method]("%c[" + this.pluginName + "]%c " + msg, "color: #DABEEF; font-weight: bold;", "");
	};
	
	this.doChatPatch = function() {
		try {
			this.patch();
			//success
			this.Log("Patched ");
		} catch(err) {
			//something went wrong. I should make this more verbose
			this.Log("Failed to patch " + ": " + err.message, "error");
		}
		this.Log('finished doChatPatch');
	};
	
	this.updateVariables = function() {
		// Update newEdgeCaseSize from current css.
		var container = $(".container-0");
		if (container !== undefined && container.length > 0){
			container = getInternalInstance(container[0]);
			var edgeDiv = getEventHandlers(container.stateNode.firstChild);
			
			newEdgeCaseSize = edgeDiv.style.height;
			//console.log("newEdgeCaseSize: " + newEdgeCaseSize);
		}
		
		// Update newSectionSize from current css.
		var section = $(".containerDefault-1bbItS");
		if (section !== undefined && section.length > 0){
			section = getInternalInstance(section[0]);
			
			newSectionSize = section.stateNode.clientHeight;
			//console.log("newSectionSize: " + newSectionSize);
		}
		
		// Update newChannelSize from current css.
		var channel = $(".containerDefault-7RImuF");
		console.log("ch: ");
		console.log(channel);
		if (channel !== undefined && channel.length > 1){
			console.log("if");
			channel = getInternalInstance(channel[1]);
			console.log("ch if: ");
			console.log(channel);
			
			newChannelSize = channel.stateNode.firstChild.clientHeight;
			//console.log("newChannelSize: " + newChannelSize);
		}
		
		// Update newVoiceUserSize from current css.
		var voiceUser = $(".draggable-3SphXU");
		if (voiceUser !== undefined && voiceUser.length > 0){
			voiceUser = getInternalInstance(voiceUser[0]);
			
			newVoiceUserSize = voiceUser.stateNode.clientHeight;
			//console.log("newVoiceUserSize: " + newVoiceUserSize);
		}
		
		// Update newVoiceBottomPaddingSize from current css.
		var voiceBottomPadding = $(".listCollapse-z8PceY, .listDefault-3i7eWQ");
		if (voiceBottomPadding !== undefined && voiceBottomPadding.length > 0){
			voiceBottomPadding = getInternalInstance(voiceBottomPadding[0]);
			var voiceSize = voiceBottomPadding.stateNode.childElementCount * newVoiceUserSize;
			
			newVoiceBottomPaddingSize = voiceBottomPadding.stateNode.clientHeight - voiceSize;
			//console.log("newVoiceBottomPaddingSize: " + newVoiceBottomPaddingSize);
		}
	};
	
	this.patch = function() {
		// Find channel element.
		var instList = $(".scroller-NXV0-d");
		if (instList.length === 0) throw "Could not find selector.";

		// Set important variables.
		var inst = getInternalInstance(instList[0]);
		var eventH = getEventHandlers(inst.stateNode.parentNode.parentNode);
		
		if(originalGetRowHeight === undefined)
			originalGetRowHeight = eventH.children[3]._owner.stateNode.getRowHeight;

		// Input to this function should be 2 variables. 
		// Recalculates the channel sizes.
		var patchRows = function() {
			var newVar = 0;			
			
			let size = 0;
			let oldSize = originalGetRowHeight(arguments[0], arguments[1]);
			for(let i = 0; size !== oldSize && size < oldSize; i++){
				if(oldSize === oldEdgeCaseSize){
					//console.log("rowEdge(" + arguments[0] + ", " + arguments[1]+"): " + i + "n/o - " + size + "/" + oldSize);
					newVar = newEdgeCaseSize;
					break;
				}
				
				size = oldChannelSize;
				
				if(i > 0){ // If in i a voice chat.
					size +=  i * oldVoiceUserSize + oldVoiceBottomPaddingSize;
				}
				
				//console.log("row(" + arguments[0] + ", " + arguments[1]+"): " + i + "n/o - " + size + "/" + oldSize);
				if(size === oldSize){
					newVar = newChannelSize;
					if(i > 0){ // If in i a voice chat.
						newVar += i * newVoiceUserSize - oldVoiceBottomPaddingSize + newVoiceBottomPaddingSize;
					}
					break;
				}
			}
			
			return newVar;
		};
		eventH.children[3]._owner.stateNode.getRowHeight = patchRows;
		
		// ---Patch sections---
		if(originalGetSectionHeight === undefined)
		originalGetSectionHeight = eventH.children[3]._owner.stateNode.getSectionHeight;

		// Input to this function should be 1 variable. 
		// Recalculates the section sizes.
		var patchSections = function() {
			var newVar = 0;
			
			let size = 0;
			let oldSize = originalGetSectionHeight(arguments[0], arguments[1]);
			
			if(oldSize === oldEdgeCaseSize){
				//console.log("sectionEdge(" + arguments[0] + "): " + "n/o - " + size + "/" + oldSize);
				newVar = newEdgeCaseSize;
			}else{
				size = oldSectionSize;
				//if(size !== oldSize)
					//console.log("section(" + arguments[0] + "): " + "n/o - " + size + "/" + oldSize);
				if(size === oldSize){
					newVar = newSectionSize;
				}
			}
			
			return newVar;
		};
		eventH.children[3]._owner.stateNode.getSectionHeight = patchSections;
		
		// Update scroll.
		eventH.children[3]._owner.stateNode.forceUpdate();
		
	};
	
};
