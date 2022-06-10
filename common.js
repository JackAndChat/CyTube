/*!
**|  CyTube Enhancements: Common
**|
**@preserve
*/
if (!window[CHANNEL.name]) window[CHANNEL.name] = {};

// Global Variables
let $chatline = $("#chatline");
let $currenttitle = $("#currenttitle");
let $messagebuffer = $("#messagebuffer");
let $userlist = $("#userlist");
let $voteskip = $("#voteskip");
let $ytapiplayer = $("#ytapiplayer");
let _vPlayer = videojs("ytapiplayer");
let messageExpireTime = 1000 * 60 * 2;
let chatExpireTime = 1000 * 60 * 60 * 2;

// ##################################################################################################################################

const formatConsoleMsg = function(desc, data){
  return msg = "[" + new Date().toTimeString().split(" ")[0] + "] " + 
    desc + ": " + JSON.stringify(data);
}

// Send debug msg to console
const debugData = function(desc, data){
  if (!CHANNEL_DEBUG) return;
  window.console.debug(formatConsoleMsg(desc, data));
}

// Send error msg to console
const errorData = function(desc, data){
  window.console.error(formatConsoleMsg(desc, data));
}

// Admin Debugger
const debugListener = function(eventName, data){ 
  if (eventName.toLowerCase() == "mediaupdate") return;
  window.console.info(formatConsoleMsg(eventName, data));
}

// ##################################################################################################################################

// JQuery Wait for an HTML element to exist
const waitForElement = function(selector, callback, checkFreqMs, timeoutMs){
  let startTimeMs = Date.now();
  (function loopSearch(){
    if ($(selector).length) {
      callback();
      return;
    }
    else {
      setTimeout(()=>{
        if (timeoutMs && ((Date.now() - startTimeMs) > timeoutMs)) return;
        loopSearch();
      }, checkFreqMs);
    }
  })();
}

// ##################################################################################################################################

// Get User from UserList
const getUser = function(name){
  let user = null;
  $("#userlist .userlist_item").each(function(index, item) {
    let data = $(item).data();
    if (data.name.toLowerCase() == name.toLowerCase()) { user = data }
  });
  return user;
}

// Is User Idle?
const isUserAFK = function(name){
  let afk = false;
  let user = getUser(name);
  if (!user) { afk = false; } else { afk = user.meta.afk }
  return afk;
}

// ##################################################################################################################################

// Remove Video on KICK
window.socket.on("disconnect", function(msg){
  if (!window.KICKED) return;
  removeVideo(event);  
});

// ##################################################################################################################################

//  Room Announcements
const roomAnnounce = function(msg){ 
  if (msg.length < 1) return;
  if (window.CLIENT.rank < 1) return;
  if (BOT_NICK.toLowerCase() == CLIENT.name.toLowerCase()) return;

  $(function() { // Why???
    makeAlert("Message from Admin", msg).attr("id","roomAnnounce").appendTo("#announcements");
  });
}

//  Moderator Announcements
const modAnnounce = function(msg){ 
  if (msg.length < 1) return;
  if (window.CLIENT.rank < 2) return;
  if (BOT_NICK.toLowerCase() == CLIENT.name.toLowerCase()) return;
    
  $(function() { // Why???
    makeAlert("Moderators", msg).attr("id","modAnnounce").appendTo("#announcements");
  });
}

// ##################################################################################################################################

// Remove Video URLs
const hideVideoURLs = function(){
  setTimeout(()=>{
    $(".qe_title").each(function(idx,data){data.replaceWith(data.text)});
    if (window.CLIENT.rank > 1) {
      $("#queue li.queue_entry div.btn-group").hide();
      $("div.btn-group > .qbtn-play").each(function(){ $(this).parent().parent().prepend(this)});
    }
  }, 2000);  
}
window.socket.on("changeMedia", hideVideoURLs);
window.socket.on("playlist", hideVideoURLs); //
window.socket.on("setPlaylistMeta", hideVideoURLs);
window.socket.on("shufflePlaylist", hideVideoURLs);

// ##################################################################################################################################

// Change the Video Title
window.socket.on("changeMedia", function(data){
  $currenttitle.text("Playing: " + data.title); // get rid of "Currently"  
});

// ##################################################################################################################################

// Player Error Reload

const refreshVideo = function(){
  $('#mediarefresh').click();
};

const videoFix = function(){
  var vplayer = videojs("ytapiplayer")
  vplayer.on("error", function(e) {
    errorData("common.Reloading Player", e);
    vplayer.createModal('ERROR: Reloading player!');
    
    window.setTimeout(function(){ refreshVideo(); }, 8000);
  });
}

window.socket.on("changeMedia", function(){
  waitForElement("#ytapiplayer", ()=>{
    var newVideo = document.getElementById("ytapiplayer");
    if (newVideo && newVideo.addEventListener) { videoFix(); }
  }, 100, 10000);
});

// ##################################################################################################################################

// Enhance VoteSkip
const onVoteSkip = function(){
  $voteskip.text("Vote to Skip " + $voteskip.text());  
}
window.socket.on("voteskip", onVoteSkip);

// ##################################################################################################################################

// Turn AFK off if PMing
const pmAfkOff = function(data){
  if (data.username.toLowerCase() != CLIENT.name.toLowerCase()) {  // Not my PM: Ignore
    let msg = data.username + "=>" + CLIENT.name;
    let whisper = { time:Date.now(), username:"[bot]", msg:msg, msgclass:"server-whisper", 
      meta:{ shadow:true, addClass:"server-whisper", addClassToNameAndTimestamp:true} };
    // addChatMessage(whisper); // FIXME
    // window.socket.emit("chatMsg", { msg: "Test5", meta:{ shadow:true } });
    return;
  }
  if (isUserAFK(CLIENT.name)) {window.socket.emit("chatMsg", { msg: "/afk" })}
}
if (CLIENT.rank < 3) { window.socket.on("pm", pmAfkOff); } // Below Admin

// ##################################################################################################################################

// Auto Expire Messages
const autoMsgExpire = function() {
  // Mark Server Messages
  $messagebuffer.find("[class^=chat-msg-\\\\\\$]:not([data-expire])").each(function(){ $(this).attr("data-expire", Date.now() + messageExpireTime)});
  $messagebuffer.find("[class^=server-msg]:not([data-expire])").each(function(){ $(this).attr("data-expire", Date.now() + messageExpireTime)});
  $messagebuffer.find("div.poll-notify:not([data-expire])").attr("data-expire", Date.now() + (messageExpireTime * 2));

  // Mark Chat Messages
  $messagebuffer.find("[class*=chat-shadow]:not([data-expire])").each(function(){ $(this).attr("data-expire", Date.now() + messageExpireTime)});
  $messagebuffer.find("[class*=chat-msg-]:not([data-expire])").each(function(){ $(this).attr("data-expire", Date.now() + chatExpireTime)});

  // Remove Expired Messages
  $messagebuffer.find("div[data-expire]").each(function(){ Date.now() > parseInt($(this).attr("data-expire")) && $(this).remove()});

  if (document.hidden) { // delay if hidden
    $messagebuffer.find("div[data-expire]").each(function(){
      $(this).attr("data-expire", parseInt($(this).attr("data-expire")) + 400);
    });
  }
};

// ##################################################################################################################################

//  DOCUMENT READY
$(document).ready(function() {
  hideVideoURLs();
  
  // Move Title to full width
  $('<div id="titlerow" class="row" />').insertBefore("#main").html($("#videowrap-header").detach());
  $("p.credit").html("&nbsp;");

  $('<link id="roomfavicon" href="' + Favicon_URL + '?ac=' + START + '" type="image/x-icon" rel="shortcut icon" />').appendTo("head");

  $("#mediarefresh").text("Refresh Video");
 
  onVoteSkip();
  
  if (ROOM_ANNOUNCEMENT !== null) roomAnnounce(ROOM_ANNOUNCEMENT);
  if (MOD_ANNOUNCEMENT !== null) modAnnounce(MOD_ANNOUNCEMENT);
  setTimeout(()=>{$("#announcements").fadeOut(800,()=>{$(this).remove()})}, 90000);

  $currenttitle.text($currenttitle.text().replace("Currently Playing: ",""));
  
  window.socket.on("addUser", (data)=>{
    $("#pm-" + data.name + " .panel-heading").removeClass("pm-gone")
    if (BOT_NICK.toLowerCase() != CLIENT.name.toLowerCase()) {
      setTimeout(()=>{ $(".userlist_owner:contains('"+ BOT_NICK + "')").parent().css("display","none") }, 6000);
    }
  });

  window.socket.on("userLeave", (data)=>{ 
    $("#pm-" + data.name + " .panel-heading").addClass("pm-gone"); 
  });
  
  window.setInterval(()=>{  // Check every second
    autoMsgExpire();

    // Remove LastPass Icon. TODO There MUST be a better way!
    $("#chatline").css({"background-image":"none"});
    $(".pm-input").css({"background-image":"none"});
  }, 1000);
  
  if (window.CLIENT.rank > 0) { 
    let chatline = $("#chatline");
    chatline.attr("placeholder", "Type here to Chat");
    chatline.focus();
  }
});

/********************  END OF SCRIPT  ********************/