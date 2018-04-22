//META{"name":"Drag&Drop Resizables"}*//

var resizables = function () {

       this.resizeGuildsWrapper = function() {
        var initialMouseX = undefined;
        var resizing = false;
        var guildWrapper = $(".guilds-wrapper");

        if(guildWrapper !== undefined && guildWrapper.length > 0){
            guildWrapper.mousedown(function(event){
                event.preventDefault();
                initialMouseX = event.pageX;
                console.log("GWW Before if initialMouseX: " + guildWrapper.css("width"))
                 if(event.pageX >= (guildWrapper.css("width").replace("px", "") - 5) && (event.pageX <= guildWrapper.css("width").replace("px","") + 5)){
                    resizing = true;
                }
            });
           $(document).mousemove(function(event){
            if(resizing === true){
                console.log("Guilds-wrapper-before: " + guildWrapper.css("width"));
                guildWrapper.css("width", event.pageX);
                console.log("Guilds-wrapper-after: " + guildWrapper.css("width"));
            }
           });

           $(document).mouseup(function(event){
            resizing = false;
           });
        }else{
            console.log("guildWrapper is not defined")
        }
    }
} 



