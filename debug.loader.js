/*!
**|  JS Library Loader
**|
**@preserve
*/
if (!window[CHANNEL.name]) window[CHANNEL.name] = {};

//  Channel Settings->Edit->JavaScript: $.getScript("https://cdn.statically.io/gh/jackandchat/cytube/main/{debug.}loader.js");

// Defaults
var START = Date.now();
if (typeof CUSTOM_LOADED === "undefined") var CUSTOM_LOADED = false;
if (typeof ChannelName_Caption === "undefined") var ChannelName_Caption = CHANNELNAME;
if (typeof Room_ID === "undefined") var Room_ID = "debug";
if (typeof ALLOW_GUESTS === "undefined") var ALLOW_GUESTS = true;
if (typeof LOAD_BOT === "undefined") var LOAD_BOT = false;
if (typeof BOT_NICK === "undefined") var BOT_NICK = "JackAndChatBot";
if (typeof ROOM_ANNOUNCEMENT === "undefined") var ROOM_ANNOUNCEMENT = "";
if (typeof MOD_ANNOUNCEMENT === "undefined") var MOD_ANNOUNCEMENT = "";
if (typeof CHANNEL_DEBUG === "undefined") var CHANNEL_DEBUG = false;

var IMABOT = (CLIENT.name.toLowerCase() == BOT_NICK.toLowerCase());

let Base_URL = "https://cdn.statically.io/gh/jackandchat/cytube/main/";
let Room_URL = Base_URL + Room_ID + "/";
let Logo_URL =  Room_URL + "logo.png";
let Favicon_URL = Room_URL + "favicon.png";

// ##################################################################################################################################

if (CHANNEL_DEBUG) {
  Base_URL += "debug/";
  Room_URL = Base_URL;
  
  if (IMABOT) {
    window.localStorage.clear();
  }
}

// ##################################################################################################################################

const loadScript = function(filename){
  try {
    $.getScript(filename + '?ac=' + START)
      .done(function(script, textStatus) {
        window.console.log("Loading " + filename + ": " + textStatus );
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
  
  loadScript(Base_URL + "common.js");
  loadScript(Room_URL + "custom.js");
  
  if (!ALLOW_GUESTS && (CLIENT.rank > 0)) {
    loadScript(Base_URL + "noguests.js");
  }

  if (IMABOT) {
    // loadScript(Base_URL + "dbLocal.js");
    loadScript(Base_URL + "roombot.js");
  }

  // loadScript(Base_URL + "betterpm.js");

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
