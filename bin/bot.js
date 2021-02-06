const tmi = require("tmi.js");
const prevent = require("../bin/prevent");
//const interface = require();

var maintenanceMode = (process.env.MAINTENANCE_MODE === 'true');
var debugMode = (process.env.DEBUG_MODE === 'true');

var opts = {
  options: {
    debug: debugMode,
  },
  identity: {
    //username: "BotKing",
    username: "amazingdancingflames",
    password: `oauth:${process.env.AMAZINGDANCINGFLAMES_OAUTH}`,
  },
  channels: [],
};

for (let channel of process.env.channels.split(", ").join(",").split(',')) {
  opts['channels'].push(channel.toLowerCase());
}

channels = [];
for (let channel of opts["channels"]) {
  channels.push({
    channel: channel,
    subscribers: [],
    queue: [],
    allowQueue: true,
    icon: "icon.webp",
    emote: "emote.png",
    subBadge: "subBadge.png",
    subOnly: false
  });
}

var helpList = [
  /* // MODS ONLY
  {
    command: "!next",
    commandHelp: "will get you the next user in queue",
  },
  {
    command: "!random",
    commandHelp: "will get you a random user from the queue",
  },
  {
    command: "!close queue",
    commandHelp: "will close the queue",
  },
  {
    command: "!open queue",
    commandHelp: "will open the queue",
  },
  {
    command: "!clear",
    commandHelp: "will clear the queue",
  },
  {
    command: "!help",
    commandHelp: "will how you the help menu",
  },
  */
  {
    command: "!list",
    commandHelp: "will show you a url where you can check the queue",
  },
  {
    command: "!join",
    commandHelp: "you will join the queue.",
  },
  {
    command: "!position",
    commandHelp: "will show the users position on the queue.",
  },
  {
    command: "!leave",
    commandHelp: "you will leave the queue.",
  },
  {
    command: "!queue",
    commandHelp: "will show the current amout of users in the queue",
  },
];

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);


if (!maintenanceMode) {
  // Connect to Twitch:
  client.connect();
}
// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  if (self) {
    return;
  } // Ignore messages from the bot

  prevent.preventSleep();

  // Remove whitespace from chat message
  const commandName = msg.trim();
  //console.log(context);

  let channelName = target.replace("#", "");
  let channel = channels.find((element) => element["channel"] == channelName);
  let queue = channel["queue"];
  let user = context["username"];

  updateSubs(channel, context);

  // mod/broadcasters commands
  if (commandName === "!next") {
    if (commandAllowed(channel, context)) {
      if (queue.length == 0) {
        outputMessage(target, "/me queue is empty!");
      } else {
        let chosen = queue[0];
        let subText = "";
        if (belongsToSub(channel, chosen)){
          subText = "and they are a sub!";
        }
        outputMessage(target, `/me the next one is ${chosen} ${subText}`);
        const index = queue.indexOf(chosen);
        channel["queue"].splice(index, 1);
      }
    }
  } else if (commandName === "!random") {
    if (commandAllowed(channel, context)) {
      if (queue.length == 0) {
        outputMessage(target, "/me queue is empty!");
      } else {
        //var chosen = pickRandom(channel); // sub bonus random
        var chosen = queue[Math.floor(Math.random() * queue.length)]; // normal random
        
        var subText = "";
        if (belongsToSub(channel, chosen)){
          subText = "and they are a sub!";
        }
        outputMessage(target, `/me the next one is ${chosen} ${subText}`);
        const index = queue.indexOf(chosen);
        channel["queue"].splice(index, 1);
      }
    }
  } else if (commandName === "!clear") {
    if (commandAllowed(channel, context)) {
      channel["queue"] = [];
      outputMessage(target, "/me the queue is now empty!");
    }
  } else if (commandName === "!close queue") {
    if (commandAllowed(channel, context)) {
      channel['allowQueue'] = false;
      outputMessage(target, "/me the queue is now closed!");
    }
  } else if (commandName === "!open queue") {
    if (commandAllowed(channel, context)) {
      channel['allowQueue'] = true;
      outputMessage(target, "/me the queue is now open!");
    }
  } else if (commandName === "!help") {
    if (commandAllowed(channel, context)) {
      for (let command of helpList) {
        outputMessage(
          target,
          `/me typing ${command.command} - ${command.commandHelp}`
        );
      }
    }
  } else if (commandName === "!hello") {
    if (commandAllowed(channel, context)) {
      outputMessage(target, `/me Hello ${user} just to tell you I am here for you <3`);
    }
  } else if (commandName === "!info") {
    if (commandAllowed(channel, context)) {
      outputMessage(target, `/me Sorry ${user}, this comman is still not implemented.. complains to Bobinzzzz `);
      console.log(channel);
    }
  } else if (commandName.substring(0, 5) === "!kick") {
    if (commandAllowed(channel, context)) {
      let commandError = false;
      console.log("inside kick command");
      if (commandName.substring(0, 7) === '!kick @') {
        let userToKick = commandName.replace("!kick @", "").split(' ')[0];
        if (userToKick === "") {
          commandError = true;
        } else {
          const index = queue.indexOf(userToKick);

          if (index > -1) {
            channel["queue"].splice(index, 1);
            outputMessage(
              target,
              `/me BOP ${userToKick} has been kicked from the queue.`
            );
          } else {
            outputMessage(
              target,
              `/me ${userToKick} wasn't in the queue.`
            );
          }
        }
      } else {
        commandError = true;
      }
      if (commandError) {
        outputMessage(
          target,
          "/me the !kick command wasn't correct"
        );
      }
    }
  } else if (commandName === "!subonly") {
    if (commandAllowed(channel, context)) {
      channel['subOnly'] = !channel['subOnly'];
      status = channel['subOnly'] == true ? " subs only" : "open to all";
      outputMessage(
        target,
        `/me The queue is now ${status}`
      );
    }
  }
  // Public commands
  else if (commandName === "!queue") {
      let plural = "";
      if (queue.length != 1) plural = "s";
      outputMessage(
        target,
        `/me currently the queue has ${queue.length} user${plural}.`
      );
  } else if (commandName === "!join") {
    const index = queue.indexOf(user);
    if (channel['allowQueue']) {
      if ((!channel['subOnly']) || (channel['subOnly'] && belongsToSub(channel, user))) {
        if (index == -1) {
          //outputMessage( target, `/me ${user} has been added to the queue - position: ${channel["queue"].length + 1}`);
          outputMessage(target, `/me ${user} has been added to the queue - position: ${channel["queue"].length + 1}`);
          channel["queue"].push(user);
        } else {
          outputMessage(
            target,
            `/me ${user} you are already on the queue - position: ${index + 1}`
          );
        }
      } else {
        outputMessage(
          target,
          `/me ${user}, sorry but the queue is currently only for subs.`
        );
      }
    } else {
      outputMessage(
        target,
        `/me ${user}, sorry but the queue is currently closed`
      );
    }
  } else if (commandName === "!list") {
    outputMessage(
      target,
      `/me ${user} you can find the current queue on: ${process.env.LOCAL_URL}/queues/${channelName}`
    );
  } else if (commandName === "!position") {
    const index = queue.indexOf(user);
    if (index == -1) {
      outputMessage(target, `/me ${user} you are not in the queue.`);
    } else {
      outputMessage(
        target,
        `/me ${user} you are on the queue - position: ${index + 1}`
      );
    }
  } else if (commandName === "!leave") {
    const user = context["username"];
    const index = queue.indexOf(user);
    if (index > -1) {
      channel["queue"].splice(index, 1);
      outputMessage(
        target,
        `/me ${user} you have been removed from the queue.`
      );
    }
  }
  
  //console.log("channel['queue']");
  //console.log(channel["queue"]);
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function commandAllowed(channel, context) {
  if (userIsMod(channel, context)) return true;
  return false;
}

function userIsMod(channel, context) {
  let user = context["username"];
  if (channel['channel'] === user) {
    console.log("if channel['channel'] === user");
    return true;
  }
  if (context["user-type"] === "mod") {
    console.log('context["user-type"] === "mod"');
    return true;
  }
  return false;
}

function updateSubs(channel, context) {
  let user = context["username"];
  if (isUserSub(channel, context)) {
    if (!(channel['subscribers'].includes(user))) {
      channel['subscribers'].push(user);
    }
  } else {
    // if the user was a sub previouly
    if (channel['subscribers'].includes(user)) {
      //channel['subscribers'].push(user);
      var index = channel['subscribers'].indexOf(user);
      if (index > -1) {
        channel['subscribers'].splice(index, 1);
      }
    }
  }
}

function pickRandom(channel, context) {
  let _queue = [];
  console.log("channel['queue']");
  console.log(channel['queue']);
  
  for (let userQueue of channel['queue']) {
    console.log("userQueue")
    console.log(userQueue)
    _queue.push(userQueue);
    if (channel['subscribers'].includes(userQueue)) {
      console.log("adding twice");
      _queue.push(userQueue);
    }
  }
  console.log("_queue")
  console.log(_queue)

  let chosen = _queue[Math.floor(Math.random() * _queue.length)];

  return chosen;
}

function belongsToSub (channel, user) {
  return (channel['subscribers'].includes(user))
}

function isUserSub(channel, context) {
  let user = context["username"];

  // check for broadcaster // needed?
  if (channel['channel'] === user) {
    //console.log(`${user} is the BROADCASTER!`);
    return true;
  }

  // check for subscriber
  if(context.badges) {
    if ('subscriber' in context.badges || 'founder' in context.badges) {
      //console.log(`${user} is a sub!`);
      return true;
    }
  }

  //console.log(`${user} is NOT a sub!`);
  return false;
}

function outputMessage(target, message) {
  //message = message + "-- LOCAL"; // dev only

  console.log("target");
  console.log(target);
  console.log("message");
  console.log(message);

  client.say(target, message);
  console.log(`- <${target}> [QueueBOT]:` + message);
}


module.exports = {
  belongsToSub: belongsToSub
}