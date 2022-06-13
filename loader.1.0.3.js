/*!
**|  JS Library Loader
**|
**@preserve
*/
if (!window[CHANNEL.name]) window[CHANNEL.name] = {};

// Defaults
var START = Date.now();
if (typeof CUSTOM_LOADED === "undefined") var CUSTOM_LOADED = false;
if (typeof ChannelName_Caption === "undefined") var ChannelName_Caption = CHANNELNAME;
if (typeof Room_ID === "undefined") var Room_ID = "debug";
if (typeof ALLOW_GUESTS === "undefined") var ALLOW_GUESTS = true;
if (typeof MUTE_GUESTS === "undefined") var MUTE_GUESTS = false;
if (typeof LOAD_BOT === "undefined") var LOAD_BOT = false;
if (typeof BOT_NICK === "undefined") var BOT_NICK = "JackAndChatBot";
if (typeof ROOM_ANNOUNCEMENT === "undefined") var ROOM_ANNOUNCEMENT = "";
if (typeof MOD_ANNOUNCEMENT === "undefined") var MOD_ANNOUNCEMENT = "";
if (typeof CHANNEL_DEBUG === "undefined") var CHANNEL_DEBUG = false;

var IMABOT = (CLIENT.name.toLowerCase() == BOT_NICK.toLowerCase());

let Base_URL = "https://cdn.statically.io/gh/jackandchat/cytube/main/www/";
let Room_URL = Base_URL + Room_ID + "/";
let Logo_URL =  Room_URL + "logo.png";
let Favicon_URL = Room_URL + "favicon.png";

// ##################################################################################################################################

const loadScript = function(filename){
  try {
    filename += '.js';
    $.getScript(filename)
      .done(function(script, textStatus) {
        window.console.log("loader.Loading " + filename + ": " + textStatus );
      })
  } catch (e) {
    window.console.error("loader.loadScript error: " + filename + " - " + JSON.stringify(e));
  }
}

const loadCSS = function(filename){
  try {
    $("head").append('<link rel="stylesheet" type="text/css" href="' + filename + '?ac=' + START + '" />');
  } catch (e) {
    window.console.error("loader.loadCSS error: " + filename + " - " + JSON.stringify(e));
  }
}

// ##################################################################################################################################

if (!CUSTOM_LOADED) { // Load Once
  CUSTOM_LOADED = true;
  
  loadScript(Base_URL + "common");
  loadScript(Room_URL + "custom");
  
  if (!ALLOW_GUESTS && (CLIENT.rank > 0)) {
    loadScript(Base_URL + "noguests");
  }

  if (IMABOT) {
    // loadScript(Base_URL + "dbLocal");
    loadScript(Base_URL + "roombot");
  }

  // loadScript(Base_URL + "betterpm");

  $(document).ready(()=>{
    $(".navbar-brand").replaceWith('<span class="navbar-brand">' + ChannelName_Caption + "</span>");
    $("ul.navbar-nav li:contains('Home')").remove();
    
    loadCSS(Base_URL + "base.css");
    loadCSS(Room_URL + "custom.css");
    $("#chancss").remove(); // No Conflicts
    $("#chanexternalcss").remove(); // No Conflicts
  });
}

// ##################################################################################################################################
/* End of Script */
