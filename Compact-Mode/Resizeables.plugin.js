//META{"name":"Resizables"}*//

var Resizables = function () {	
	this.resizeGuildsWrapper = function() {
		var initialMouseX = undefined;
		var resizing = false;
		var guildsWrapper = $(".guilds-wrapper");

		if(guildsWrapper !== undefined && guildsWrapper.length > 0){
			guildsWrapper.mousedown(function(event){
				event.preventDefault();
				initialMouseX = event.pageX;
				console.log("GWW Before if initialMouseX: " + guildsWrapper.css("width"))
				 if(event.pageX >= (guildsWrapper.css("width").replace("px", "") - 5) && (event.pageX <= guildsWrapper.css("width").replace("px","") + 5)){
					resizing = true;
				}
			});
		   $(document).mousemove(function(event){
			if(resizing === true){
				console.log("Guilds-wrapper-before: " + guildsWrapper.css("width"));
				guildsWrapper.css("width", event.pageX);
				console.log("Guilds-wrapper-after: " + guildsWrapper.css("width"));
			}
		   });

		   $(document).mouseup(function(event){
			resizing = false;
		   });
		}else{
			console.log("guildsWrapper is not defined");
		}
	}
	
	this.getName = function() {
        return 'Resizables';
    };
    this.getDescription = function() {
        return 'Resize menus and bars by drag N drop.';
    };
    this.getVersion = function() {
        return '0.0.1';
    };
    this.getAuthor = function() {
        return 'Credskiz';
    };
	this.start = function(){
		this.resizeGuildsWrapper();
	}
	this.load = function(){
		console.log("Resizables Loaded.");
	}
}
