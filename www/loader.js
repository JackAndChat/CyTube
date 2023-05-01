/*!
**|  JS Library Loader
**|
**@preserve
*/
'use strict';

// https://cdn.jsdelivr.net/gh/JackAndChat/CyTube@latest/www/loader.js
    
if (!window[CHANNEL.name]) { window[CHANNEL.name] = {}; }

let Base_URL = "https://jacncdn.github.io/www/";

// ----------------------------------------------------------------------------------------------------------------------------------

window[CHANNEL.name].jsScriptsIdx = 0;
window[CHANNEL.name].jsScripts = [
  Base_URL + "loader.js"
];

if (window.CLIENT.rank > Rank.Moderator) { // At least Owner
  // window[CHANNEL.name].jsScripts.push(Base_URL + "defaults.js");
}

// ----------------------------------------------------------------------------------------------------------------------------------
const jsScriptsLoad = function(){ // Load Javascripts in order
  if (window[CHANNEL.name].jsScriptsIdx < window[CHANNEL.name].jsScripts.length) {
    let filename = window[CHANNEL.name].jsScripts[window[CHANNEL.name].jsScriptsIdx];

    $.getScript(filename)
      .done(function(script, textStatus) {
        window.console.log("loader.getScript " + filename + ": " + textStatus );
        window[CHANNEL.name].jsScriptsIdx++;
        jsScriptsLoad();  // Recurse
      })
      .fail(function(jqxhr, settings, exception) {
        if(arguments[0].readyState==0){
          window.console.error(filename + " FAILED to load!");
        } else {
          window.console.error(filename + " loaded but FAILED to parse! " + arguments[2].toString());
        }
      });
  }
}

// ----------------------------------------------------------------------------------------------------------------------------------
jsScriptsLoad();

// ##################################################################################################################################
/* End of Script */
