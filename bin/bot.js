const tmi = require("tmi.js");
//const interface = require();

var opts = {
  options: {
    debug: true,
  },
  identity: {
    //username: "BotKing",
    username: "amazingdancingflames",
    password: `oauth:${process.env.AMAZINGDANCINGFLAMES_OAUTH}`,
  },
  channels: [],
};

for (let channel of process.env.channels.replace(', ', ',').split(',')) {
  opts['channels'].push(channel.toLowerCase());
}

var allowQueue = true;
var queue = [];
var helpList = [
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
  {
    command: "!join",
    commandHelp: "the user will join the queue",
  },
  {
    command: "!list",
    commandHelp: "dont implemented yet - type !position",
  },
  {
    command: "!position",
    commandHelp: "will show the users position on the queue",
  },
  {
    command: "!leave",
    commandHelp: "the user will leave the queue",
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

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  if (self) {
    return;
  } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();
  console.log("commandName");
  console.log("-" + commandName + "-");
  console.log("queue");
  console.log(queue);
  //console.log(context);

  let user = context["username"];
  console.log(user);

  // mod/broadcasters commands
  console.log(`${user} is mod or broadcaster`);
  if (commandName === "!next") {
    if (commandAllowed(context)) {
      if (queue.length == 0) {
        outputMessage(target, "/me queue is empty!");
      } else {
        var chosen = queue[0];
        outputMessage(target, "/me the next one is @" + chosen);
        const index = queue.indexOf(chosen);
        queue.splice(index, 1);
      }
    }
    console.log("queue");
    console.log(queue);
  } else if (commandName === "!random") {
    if (commandAllowed(context)) {
      if (queue.length == 0) {
        outputMessage(target, "/me queue is empty!");
      } else {
        var chosen = queue[Math.floor(Math.random() * queue.length)];
        outputMessage(target, "/me the next one is @" + chosen);
        const index = queue.indexOf(chosen);
        queue.splice(index, 1);
      }
    }
    console.log("queue");
    console.log(queue);
  } else if (commandName === "!clear") {
    if (commandAllowed(context)) {
      queue = [];
      outputMessage(target, "/me the queue is now empty!");
    }
  } else if (commandName === "!close queue") {
    if (commandAllowed(context)) {
      allowQueue = false;
      outputMessage(target, "/me the queue is now closed!");
    }
  } else if (commandName === "!open queue") {
    if (commandAllowed(context)) {
      allowQueue = true;
      outputMessage(target, "/me the queue is now open!");
    }
  } else if (commandName === "!help") {
    if (commandAllowed(context)) {
      for (let command of helpList) {
        outputMessage(
          target,
          `/me  typing ${command.command} - ${command.commandHelp}`
        );
      }
    }
  } else if (commandName === "!queue") {
    if (commandAllowed(context)) {
      let plural = '';
      if (queue.length != 1) plural = 's';
      outputMessage(target, `/me there are currently ${queue.length} user${plural} on the queue.`);
    }
  }
  // Public commands
  else if (commandName === "!join") {
    const index = queue.indexOf(user);
    if (allowQueue) {
      if (index == -1) {
        outputMessage(
          target,
          `/me @${user} has been added to the queue - position: ${
            queue.length + 1
          }`
        );
        queue.push(user);
      } else {
        outputMessage(
          target,
          `/me @${user} you are already on the queue - position: ${index + 1}`
        );
      }
    } else {
      outputMessage(
        target,
        `/me @${user}, sorry but the queue is currently closed`
      );
    }
    console.log("queue");
    console.log(queue);
  } else if (commandName === "!list") {
    outputMessage(
      target,
      `/me @${user} !list is not implemeted yet. Type !position to check if you are on the queue`
    );
    console.log("queue");
    console.log(queue);
  } else if (commandName === "!position") {
    const index = queue.indexOf(user);
    if (index == -1) {
      outputMessage(target, `/me @${user} you are not in the queue`);
    } else {
      outputMessage(
        target,
        `/me @${user} you are on the queue - position: ${index + 1}`
      );
    }
  } else if (commandName === "!leave") {
    let user = context["username"];
    const index = queue.indexOf(user);
    if (index > -1) {
      queue.splice(index, 1);
      outputMessage(
        target,
        `/me @${user} you have been removed from the queue`
      );
    }
    console.log("queue");
    console.log(queue);
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function commandAllowed(context) {
  if (userIsMod(context)) return true;
  return false;
}

function userIsMod(context) {
  let user = context["username"];
  console.log("opts[channels]");
  console.log(opts["channels"]);
  console.log("user");
  console.log(user);
  if (opts["channels"].includes("#" + user)) {
    return true;
  }
  if (context["user-type"] === "mod") {
    return true;
  }
  return false;
}

function outputMessage(target, message) {
  client.say(target, message);
  console.log(message);
}
