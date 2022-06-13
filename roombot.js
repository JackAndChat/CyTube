/*!
**|  CyTube Enhancements: Room Bot
**|
**@preserve
*/
if (!window[CHANNEL.name]) window[CHANNEL.name] = {};

// https://en.wikipedia.org/wiki/List_of_Unicode_characters
window[CHANNEL.name].botReplyMsg = "I'm a bot! Don't expect a reply.";
window[CHANNEL.name].botPrefixIgnore = String.fromCharCode(157);
window[CHANNEL.name].botPrefixInfo = String.fromCharCode(158);
window[CHANNEL.name].lastChatMsgTime = Date.now();
window[CHANNEL.name].clearDelayMS = 60 * 60 * 1000;

// ##################################################################################################################################

window[CHANNEL.name].botPlayerDefaults = function(){
  try { PLAYER.setVolume(0.0) } catch (e) {}
  removeVideo(event);
}
waitForElement("#ytapiplayer", window[CHANNEL.name].botPlayerDefaults, 100, 10000);

// ##################################################################################################################################

window[CHANNEL.name].doBotReply = function(data) {
  debugData("roombot.doBotReply", data);
  if (data.username.toLowerCase() == CLIENT.name.toLowerCase()) return; // Don't talk to yourself

  if (data.msg.startsWith(window[CHANNEL.name].botPrefixInfo)) { // Internal Message
    debugData("roombot.botPrefixInfo", data);
    return;
  }
  
  window.socket.emit("pm", { to: data.username, 
    msg: window[CHANNEL.name].botPrefixIgnore + window[CHANNEL.name].botReplyMsg, meta: {} });
  
  if (!data.msg.startsWith(window[CHANNEL.name].botPrefixIgnore)) {
    debugData("roombot.botPrefixIgnore", data);
    return; // NOT the Warning
  }
  // if (!data.msg.startsWith("FYI: Guest")) return; // NOT the Warning

  setTimeout(()=>{ // Remove PM
    $("#pm-" + data.username).remove();
    $("#pm-placeholder-" + data.username).remove();
  }, 250);
};
window.socket.on("pm", window[CHANNEL.name].doBotReply);

// ##################################################################################################################################

window[CHANNEL.name].userJoin = function(data){
  debugData("roombot.userJoin", data);
  if (data.rank > 1) return;  // Moderator
  // if (data.name.toLowerCase() == CLIENT.name.toLowerCase()) return; // Ignore yourself

  let alias = data.meta.aliases.join(",").toLowerCase();
  debugData("roombot.userJoin.alias", alias);

  if (data.name.toLowerCase().indexOf("guest") >= 0) { // Shadow Mute "guests"
    window.socket.emit("chatMsg", { msg: "/smute " + data.name, meta: {} });
    window.socket.emit("pm", { to: data.name, msg: window[CHANNEL.name].botPrefixIgnore + "FYI: Guest nicks are *Muted* in chat.", meta: {} });
  }

  if (data.name.toLowerCase().indexOf("Gooner112233") >= 0) { // Shadow Mute "Thief"
    window.socket.emit("chatMsg", { msg: "/smute " + data.name, meta: {} });
  }
  
  if (alias.indexOf("rape") >= 0) {
    setTimeout(()=>{
      window.socket.emit("chatMsg", { msg: "/ipban " + data.name + " Rape", meta: {} });
    }, 500);
  }
  
  if ((alias.indexOf("perv") >= 0) && 
      ((alias.indexOf("cd") >= 0) ||
       (alias.indexOf("cross") >= 0))) {
    setTimeout(()=>{
      window.socket.emit("chatMsg", { msg: "/ipban " + data.name + " ped0", meta: {} });
    }, 1500);
  }
  
  if (data.meta.ip.startsWith("zac.yO4.Ivy")) {
    setTimeout(()=>{
      window.socket.emit("chatMsg", { msg: "/ipban " + data.name + " ped0 cdperv", meta: {} });
    }, 1500);
  }
}
window.socket.on("addUser", window[CHANNEL.name].userJoin);

// ##################################################################################################################################

window.socket.on("chatMsg", (data)=>{ 
  if (data.username.startsWith('[')) return; // Ignore Server Messages
  debugData("roombot.chatMsg", data);
  
  window[CHANNEL.name].lastChatMsgTime = Date.now();
  
  let user = getUser(data.username);
  if (user === null) return;
  if (user.rank > 1) return;  // Moderator
  
  if ((data.msg.toLowerCase().indexOf("kosmi") >= 0) ||
      (data.msg.toLowerCase().indexOf("cytu.be") >= 0) ||
      (data.msg.toLowerCase().indexOf("jit.si") >= 0)) {
    window.socket.emit("chatMsg", { msg: "/smute " + data.username, meta: {} });
  }
});

// ##################################################################################################################################

const pauseVideo = function(userCount){
  let $entry = $('#queue > li.queue_entry:contains("Video Paused")'); 
  let uid = $entry.data("uid") || -1; 
  debugData("roombot.pauseVideo.uid", uid);

  if (uid > 0) { // Video Paused
    if (userCount > 1) { // Restart Videos
      debugData("roombot.pauseVideo.Restart", 0);
      try { socket.emit("delete", uid) } catch (e){} 
    }
  }
  else if (userCount <= 1) { // Pause Videos
    debugData("roombot.shufflePlaylist");
    window.socket.emit("shufflePlaylist");
    
    debugData("roombot.clear");
    window.socket.emit("chatMsg", { msg: "/clear", meta: {} });
    
    debugData("roombot.queue");
    window.socket.emit("queue", { id: "https://cdn.statically.io/gh/jackandchat/cytube/main/www/adults-only.json", pos:"end", type:"cm", "temp":true });
    
    socket.once("queue",(data)=>{
      debugData("roombot.jumpTo.Temp", data);
      window.socket.emit("jumpTo", data.item.uid);
    });
  }
}

// ##################################################################################################################################
// Replacement Callbacks

const tryReconnect = function(){
  setTimeout(()=>{
    debugData("roombot.tryReconnect", "");
    if (window.socket && window.socket.connected) return;
    window.location.reload(true);
  }, 10000);
}

const BOT_Callbacks = {

  disconnect: function(){
    debugData("roombot.disconnect", KICKED);
    if (KICKED) return;
    
    $("<div/>")
      .addClass("server-msg-disconnect")
      .text("Disconnected from server.")
      .appendTo($("#messagebuffer"));
    scrollChat();

    tryReconnect();
  },

  // Socket.IO error callback
  error: function(msg) {
    errorData("roombot.errorMsg", msg);

    window.SOCKET_ERROR_REASON = msg;
    $("<div/>")
      .addClass("server-msg-disconnect")
      .text("Unable to connect: " + msg)
      .appendTo($("#messagebuffer"));
    scrollChat();
    
    tryReconnect();
  },

  errorMsg: function(data) {
    errorData("roombot.errorMsg", data);
    
    $("<div/>")
      .addClass("server-msg-disconnect")
      .text("ERROR: " + data.msg)
      .appendTo($("#messagebuffer"));
    scrollChat();
  },

  pm: function(data) {
    debugData("roombot.pm", data);
    if (data.username === CLIENT.name) return;

    var chatMsg = { time:Date.now(), username:data.username, msg: "BOT: " + data.msg,
          meta:{ shadow:false, addClass:"action", addClassToNameAndTimestamp:true} };
    addChatMessage(chatMsg);
    return;
  },

  announcement: function(data) {
    debugData("roombot.announcement", data);
    return;
  },

  usercount: function(userCount) {
    debugData("roombot.userCount", userCount);
    
    CHANNEL.usercount = userCount;
    var countText = userCount + " connected user";
    if(userCount != 1) {
      countText += "s";
    }
    $("#usercount").text(countText);

    pauseVideo(userCount);
  }
}

// ----------------------------------------------------------------------------------------------------------------------------------

window[CHANNEL.name].setupBOT_Callbacks = function(data){
  for (var key in BOT_Callbacks) {
    debugData("roombot.setupCallbacks", key);
    window.Callbacks[key] = BOT_Callbacks[key];
  }
}
window.socket.on('changeMedia', window[CHANNEL.name].setupBOT_Callbacks);

// ##################################################################################################################################

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

window[CHANNEL.name].randomMsgDelayMS = 20 * 60 * 1000;
window[CHANNEL.name].lastBotMsg = 0;
window[CHANNEL.name].botMsgs = [
  ':green:CyTube TIP::z: Add your _ASL_ to your :cyan:Account->Profile:z: so it shows up when you hover over your nickname',
  ':green:CyTube TIP::z: If you select :cyan:Options->General->Layout->SyncTube:z: it will put the chat on the right side, MyCircle style',
  ':green:CyTube TIP::z: To skip the current video click the :cyan:"Vote to Skip":z: button',
  'If you like Teen videos check out :green:https://cytu.be/r/Familiar-Teens',
  'If you like Bikini videos check out :green:https://cytu.be/r/microbikini',
  'If you like Classic/Retro videos check out :green:https://cytu.be/r/ClassicStars2022',
  'If you like Gonzo videos check out :green:https://cytu.be/r/XtremeFun',
  'If you like Playboy Playmates check out :green:https://cytu.be/r/StagParty',
  'Send Requests, Comments, and Constructive Criticisms to :green:JackAndChat@protonmail.com',
];

// shuffleArray(window[CHANNEL.name].botMsgs);

window[CHANNEL.name].randomMsg = function(){
  let msg = window[CHANNEL.name].botMsgs[window[CHANNEL.name].lastBotMsg];
  socket.emit("chatMsg", { msg:msg, meta:{} });

  window[CHANNEL.name].lastChatMsgTime = Date.now();
  window[CHANNEL.name].lastBotMsg++;
  if (window[CHANNEL.name].lastBotMsg >= window[CHANNEL.name].botMsgs.length) {
    window[CHANNEL.name].lastBotMsg = 0;
  }
}

// ##################################################################################################################################

// Check every 2 seconds
setInterval(()=>{
  if ((window[CHANNEL.name].lastChatMsgTime + window[CHANNEL.name].clearDelayMS) < Date.now()) { 
    window.socket.emit("chatMsg", { msg: "/clear", meta: {} });
    window[CHANNEL.name].lastChatMsgTime = Date.now();
  }

/*
  if ((window[CHANNEL.name].lastChatMsgTime + window[CHANNEL.name].randomMsgDelayMS) < Date.now()) { 
    window[CHANNEL.name].randomMsg();
  }
*/

  // Keep Bot AFK
  if (!isUserAFK(CLIENT.name)) { window.socket.emit("chatMsg", { msg: "/afk" })};
}, 2000);

// ##################################################################################################################################

//  DOCUMENT READY
$(document).ready(function() {
  debugData("roombot.documentReady");

  window[CHANNEL.name].setupBOT_Callbacks();
  
   let userCount = $("#userlist .userlist_item").length;
   pauseVideo(userCount);
  
/*  
  window.socket.removeAllListeners("error");
  window.socket.on("error", function(data) {
    errorData("roombot.onError", data);
  });
*/  
});

// ##################################################################################################################################
