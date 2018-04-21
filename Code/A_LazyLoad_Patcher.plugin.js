//META{"name":"a_lazyload_patcher"}*//


/* TODO fix ordinary channel bug, might be section padding causing it? */
/* TODO add member support */
/* TODO add friends support? */

//jshint esversion: 6

var a_lazyload_patcher = function() {	
	this.getName = function() {
		return 'A LazyLoad Patcher';
	};
	this.getDescription = function() {
		return 'A LazyLoad Patcher - Patches Discord\'s lazy loading to allow for themes that modify channel and section heights. Credits to noodlebox#0155, Mydayyy#0344 and Kakkela#6315';
	};
	this.getVersion = function() {
		return '1.3.0.1';
	};
	this.getAuthor = function() {
		return 'HoLLy#2750';
	};

	this.load = function() {
		this.Log("Loaded");
	};
	this.start = function() {
		this.Log("Started");
		//if we start up to the friends page, channels won't be loaded
		if (location.pathname.startsWith('/channels/@me')) {

			//so, we run our patching code once, when we click a guild icon
			$('.guild').has('.avatar-small').on('click.llpPatcher', () => {

				//run after 1000ms, to make sure it is loaded
				// TODO find a way to not use timeout here.
				setTimeout(() => this.doUpdateVariables(), 1000);
				setTimeout(() => this.doPatchFunctions(), 1000);
				$('.guild').off('click.llpPatcher');
			});
		} else {
			setTimeout(() => this.doUpdateVariables(), 1000);
			setTimeout(() => this.doPatchFunctions(), 1000);
		}
	};
	this.stop = function() {
		this.Log("Stopped");
	};
	this.unload = function() {
		this.Log("Unloaded");
	};
	this.onMessage = function() { };
	this.onSwitch = function() {
		
		// TODO find a way to not use timeout here.
		setTimeout(() => this.doUpdateVariables(), 3000);
		// If in friends.
		if (location.pathname.startsWith('/channels/@me')) {
			wasInFriends = 1;
			originalGetRowHeight = undefined;
			originalGetSectionHeight = undefined;
		}
		// Else in channels.
		else {
			// Only run patch once every time you go from friends to channels I think.
			if (wasInFriends > 0 ) {
				
				// TODO find a way to not use timeout here.
				setTimeout(() => this.doPatchFunctions(), 1000);
				wasInFriends = 1;
			} else if ($('.containerDefault-1bbItS').height() !== null && wasInFriends > 0 ) {
				
				// TODO find a way to not use timeout here.
				setTimeout(() => this.doPatchFunctions(), 1000);
				wasInFriends = 0;
			}
		}
	};
	this.observer = function(e) { };
	this.getSettingsPanel = function() { };

	this.Log = function(msg, method = "log", error) {
		console[method]("%c[" + this.getName() + "]%c " + msg, "color: #DABEEF; font-weight: bold;", "");
	};

	const getInternalInstance = e => e[Object.keys(e).find(k => k.startsWith("__reactInternalInstance"))];
	const getEventHandlers = e => e[Object.keys(e).find(k => k.startsWith("__reactEventHandlers"))];

	const oldEdgeCaseSize = 16;
	const oldChannelSize = 34;
	const oldSectionSize = 48;
	const oldVoiceUserSize = 28;
	const oldvoicePaddingBottomSize = 8;

	var newEdgeCaseSize = 16;
	var newSectionSize = 20;
	var newChannelSize = 20;
	var newVoiceUserSize = 20;
	var newVoicePaddingBottomSize = 0;

	// Store old function here.
	var originalGetRowHeight;
	var originalGetSectionHeight;

	var wasInFriends = 0;
	
	var DEBUG = false;
	
	this.doUpdateVariables = function() {
		try {
			this.updateEdgeCase();
			this.updateSectionSize();
			this.updateChannel();
			this.updateVoiceUser();
			this.updateVoicePaddingBottom();
			
			// DEBUG: Update variables ran correctly.
			if(DEBUG)
				this.Log("Updated variables.");
		} catch(err) {
			this.Log("Failed to update variables " + ": " + err.message, "error");
		}
		//this.Log('finished doUpdateVariables');
	};
	this.doPatchFunctions = function() {
		try {
			this.patchFunctions();
			
			// DEBUG: Patched functions ran correctly.
			if(DEBUG)
				this.Log("Patched functions.");
		} catch(err) {
			this.Log("Failed to patch functions" + ": " + err.message, "error");
		}
		//this.Log('finished doPatchFunctions');
	};

	this.updateEdgeCase = function() {
		// Update newEdgeCaseSize from current css.
		var container = $(".container-0");
		if (container !== undefined && container.length > 0){
			container = getInternalInstance(container[0]);
			var edgeDiv = getEventHandlers(container.stateNode.firstChild);

			newEdgeCaseSize = edgeDiv.style.height;
			
			// DEBUG: newEdgeCaseSize.
			if(DEBUG)
				console.log("newEdgeCaseSize: " + newEdgeCaseSize);
		}
	};
	this.updateSectionSize = function() {
		// Update newSectionSize from current css.
		var section = $(".containerDefault-1bbItS");
		if (section !== undefined && section.length > 0){
			section = getInternalInstance(section[0]);

			newSectionSize = section.stateNode.clientHeight;
			
			// DEBUG: newSectionSize
			if(DEBUG)
				console.log("newSectionSize: " + newSectionSize);
		}
	};
	this.updateChannel = function() {
		// Update newChannelSize from current css.
		var channel = $(".containerDefault-7RImuF");
		if (channel !== undefined && channel.length > 1){
			channel = getInternalInstance(channel[1]);
			
			newChannelSize = channel.stateNode.firstChild.clientHeight;
			
			// DEBUG: newChannelSize
			if(DEBUG)
				console.log("newChannelSize: " + newChannelSize);
		}
	};
	this.updateVoiceUser = function() {
		// Update newVoiceUserSize from current css.
		var voiceUser = $(".draggable-3SphXU");
		if (voiceUser !== undefined && voiceUser.length > 0){
			voiceUser = getInternalInstance(voiceUser[0]);

			newVoiceUserSize = voiceUser.stateNode.clientHeight;
			
			// DEBUG: newVoiceUserSize
			if(DEBUG)
				console.log("newVoiceUserSize: " + newVoiceUserSize);
		}
	};
	this.updateVoicePaddingBottom = function() {
		// Update newVoicePaddingBottomSize from current css.
		var voicePaddingBottom = $(".listCollapse-z8PceY, .listDefault-3i7eWQ");
		if (voicePaddingBottom !== undefined && voicePaddingBottom.length > 0){
			voicePaddingBottom = getInternalInstance(voicePaddingBottom[0]);
			var voiceSize = voicePaddingBottom.stateNode.childElementCount * newVoiceUserSize;

			newVoicePaddingBottomSize = voicePaddingBottom.stateNode.clientHeight - voiceSize;
			
			// DEBUG: newVoicePaddingBottomSize
			if(DEBUG)
				console.log("newVoicePaddingBottomSize: " + newVoicePaddingBottomSize);
		}
	};

	this.patchFunctions = function() {
		try{
			var instList = $(".scroller-NXV0-d");
			if (instList.length === 0){
				console.log("Could not find selector.");
				throw "Could not find selector.";
			}

			// Set important variables.
			var inst = getInternalInstance(instList[0]);
			var eventH = getEventHandlers(inst.stateNode.parentNode.parentNode);

			// Patch getRowHeight
			try{
				// Check so we don't overwrite the reference to the old function.
				if(originalGetRowHeight === undefined) {
					originalGetRowHeight = eventH.children[3]._owner.stateNode.getRowHeight;
				}
				// Overwrite discords function to getRowHeight.
				eventH.children[3]._owner.stateNode.getRowHeight = this.updatedGetRowsHeight;
			} catch(err) {
				console.error("Couldn't patch getRowHeight: " + err.message);
			}
			
			// Patch getSectionHeight
			try{
				// Check so we don't overwrite the reference to the old function.
				if(originalGetSectionHeight === undefined) {
					originalGetSectionHeight = eventH.children[3]._owner.stateNode.getSectionHeight;
				}

				// Overwrite discords function to getSectionHeight.
				eventH.children[3]._owner.stateNode.getSectionHeight = this.updatedGetSectionHeight;
			} catch(err) {
				console.error("Couldn't patch getSectionHeight: " + err.message);
			}
			
			try{
				// Update.
				eventH.children[3]._owner.stateNode.forceUpdate();
			} catch(err) {
				console.error("Couldn't update: " + err.message);
			}
		} catch(err) {
			console.error("Couldn't init instlist: " + err.message);
		}

	};

	// Recalculates the channel sizes.
	this.updatedGetRowsHeight = function() {
		var newVar = 0;
		// Input to this function should be 2 variable. (Section, Channel)
		// Return is the size of that channel.

		let size = 0;
		var oldSize;
		
		// Try calling old function to get the value to recalculate.
		try{
			oldSize = originalGetRowHeight(arguments[0], arguments[1]);
		} catch(err) {
			console.error("Couldn't load channel undefined: " + arguments[0] + ", " + arguments[1]);
		}
		
		// If it didn't get a value, return undefined.
		if(oldSize === undefined){
			// DEBUG: oldSize was undefined.
			if(DEBUG)
				console.error("updatedGetSectionHeight = undefined");
			return undefined;
		}
		
		// Loop until sizes matches, need to loop to account for voice channel sizes.
		for(let i = 0; size !== oldSize && size < oldSize; i++){
			
			// If EdgeCase
			if(oldSize === oldEdgeCaseSize){
				newVar = newEdgeCaseSize;
				
				// DEBUG: EdgeCase newSize vs OldSize.
				if(DEBUG)
					console.log("rowEdge(" + arguments[0] + ", " + arguments[1]+"): " + i + "n/o - " + size + "/" + oldSize);
				break;
			}
			// Else
			else{
				size = oldChannelSize;

				// If in i a voice chat.
				if(i > 0){
					size +=  i * oldVoiceUserSize + oldvoicePaddingBottomSize;
				}
				
				// If matching size, then done calculating/looping.
				if(size === oldSize){
					newVar = newChannelSize;
					
					// If in i a voice chat.
					if(i > 0){
						newVar += i * newVoiceUserSize - oldvoicePaddingBottomSize + newVoicePaddingBottomSize;
					}
					
					// DEBUG: newSize vs OldSize.
					if(DEBUG)
						console.log("row(" + arguments[0] + ", " + arguments[1]+"): " + i + "n/o - " + size + "/" + oldSize);
					break;
				}
			}
		}
	
		
		// DEBUG: print rowHeight;
		if(DEBUG)
			console.log(newVar);
		return newVar;
	};

	// Recalculates the section sizes.
	this.updatedGetSectionHeight = function() {
		var newVar = 0;
		// Input to this function should be 1 variable. (Section)
		// Return is the size of that section.

		let size = 0;
		var oldSize;
		
		// Try calling old function to get the value to recalculate.
		try{
			oldSize = originalGetSectionHeight(arguments[0]);
		} catch(err) {
			console.error("Couldn't load channel undefined: " + arguments[0]);
		}
		
		// If it didn't get a value, return undefined.
		if(oldSize === undefined){
			// DEBUG: oldSize was undefined.
			if(DEBUG)
				console.error("updatedGetSectionHeight = undefined");
			return undefined;
		}
		
		// If edgeCase.
		if(oldSize === oldEdgeCaseSize){
			newVar = newEdgeCaseSize;
			
			// DEBUG: EdgeCase newSize vs OldSize.
			if(DEBUG)
				console.log("sectionEdgeCase(" + arguments[0] + "): " + "n/o - " + newEdgeCaseSize + "/" + oldSize);
		} else {
			size = oldSectionSize;
			if(size === oldSize){
				newVar = newSectionSize;
			}
			
			// DEBUG: newSize vs oldSize
			if(DEBUG)
				if(size !== oldSize)
					console.log("section(" + arguments[0] + "): " + "n/o - " + size + "/" + oldSize);
		}
		
		// DEBUG: print sectionHeight;
		if(DEBUG)
			console.log(newVar);
		return newVar;
	};

};
