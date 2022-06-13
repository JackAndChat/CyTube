/*!
**|  CyTube Enhancements: No Guests
**|
**@preserve
*/
if (!window[CHANNEL.name]) window[CHANNEL.name] = {};

const guestWarnMsg = 'Register to chat.\nNO email required, just a password!';
const guestKickMsg = 'No guests allowed. Please register!';

const guestWarnMs = 6000;
const guestKickMs = 60000;
if (typeof BOT_NICK === "undefined") var BOT_NICK = "JackAndChatBot";

//  0 - Anon
//  1 - Registered
//  1.5 - Leader
//  2 - Moderator
//  3 - Admin
//  5 - Owner

const guestWarn = function(data){ // Admin
  if (data.rank > 0 ) return;  // Registered

  setTimeout(()=>{
    if (!getUser(data.name)) return;
    socket.emit("pm", { to: data.name, msg: guestWarnMsg, meta: {} });
  }, guestWarnMs);

  setTimeout(()=>{
    if (!getUser(data.name)) return;
    socket.emit("chatMsg", { msg: "/kick " + data.name + " " + guestKickMsg, meta: {} });
  }, guestKickMs);
}
if (CLIENT.rank == 3) { socket.on("addUser", guestWarn) }

const guestKick = function(data){ // Moderators
  if (data.rank > 0 ) return;  // Registered
  if (getUser(BOT_NICK)) return; // Let Bot handle it if here
  
  setTimeout(()=>{
    if (!getUser(data.name)) return;
    socket.emit("chatMsg", { msg: "/kick " + data.name + " " + guestKickMsg, meta: {} });
  }, (guestKickMs * 2));
}
if (CLIENT.rank == 2) { socket.on("addUser", guestKick); }

// Guests should never get this far
loadCSS(Base_URL + '/noguests.css');

/* *****************************************************************************************
.profile-box{background-color:#bf935a;color:white}
#chanjs-allow-prompt > a, #chanjs-allow-prompt > button, #chanjs-deny{display:none}
#chanjs-allow-prompt > span, #chanjs-allow-prompt > div.checkbox > label{font-size:14px}
#chanjs-allow-prompt > div.checkbox:before{content:'Required to Chat';font-size:14px !important;font-weight:600 !important}
#chanjs-allow{font-size:0px;background-color:green;border-radius:15px;background-image:none;padding:10px}
#chanjs-allow:before{font-size:14px !important;content:'ALLOW'}

.vjs-tech{filter:blur(8px) brightess(0.5) grayscale(100%)}
.vjs-text-track-display, .pm-buffer{
  background-image:url(https://cdn.statically.io/gh/jackandchat/cytube/main/cdn/register.png?ac=2);
  background-repeat:no-repeat;
  background-size:cover;
  background-position:center center;
}
.pm-input{visibility:hidden}
.pm-buffer{background-size:90%;background-position:bottom left}
***************************************************************************************** */

/* End of Script */
