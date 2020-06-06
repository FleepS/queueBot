const tmi = require('tmi.js');
//const interface = require();

var opts = {
    options: {
        debug: true,
    },
    identity: {
        username: 'amazingdancingflames',
        password: `oauth:${process.env.AMAZINGDANCINGFLAMES_OAUTH}`
    },
    channels: [
        'bobinzzzz',
        'misterwillisgg'
    ]
};

var queue = []



// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot
    opts.channels.push('bobinzzzz');
    //console.log(context);

    // Remove whitespace from chat message
    const commandName = msg.trim();
    console.log("commandName");
    console.log('-' + commandName + '-');
    console.log("queue");
    console.log(queue);
    //console.log(context);

    // If the command is known, let's execute it
    let user = context['username'];
    if (commandName === '!random') {
        if (commandAllowed(context)) {
            if (queue.length == 0) {
                //client.say(target, '/me queue is empty!');
                console.log('/me queue is empty!');
            } else {
                var chosen = queue[Math.floor(Math.random() * queue.length)];
                //client.say(target, '/me the next one is ' + chosen);
                console.log('/me the next one is ' + chosen);
                const index = queue.indexOf(chosen);
                queue.splice(index, 1);
            }
        } else {
            console.log("not a mod nor broadcaster");
        }
        console.log("queue");
        console.log(queue);
    }
    if (commandName === '!join') {
        const index = queue.indexOf(user);
        if (index == -1) {
            //client.say(target, `/me @${user} have been added to the queue`);
            console.log(`/me @${user} have been added to the queue`);
            queue.push(user)
        } else {
            //client.say(target, `/me @${user} you are already on the queue`);
            console.log(`/me @${user} you are already on the queue`);
        }
        console.log("queue");
        console.log(queue);
    }
    if (commandName === '!list') {
        //client.say(target, `/me @${user} !list is not implemeted yet. Type !join to check if you are on the queue`);
        console.log(`/me @${user} !list is not implemeted yet. Type !join to check if you are on the queue`);
        console.log("queue");
        console.log(queue);
    }
    if (commandName === '!leave') {
        let user = context['username'];
        const index = queue.indexOf(user);
        if (index > -1) {
            queue.splice(index, 1);
            //client.say(target, `/me @${user} you have been removed from the queue`);
            console.log(`/me @${user} you have been removed from the queue`);
        }
        console.log("queue");
        console.log(queue);
    }
    if (commandName === '!clear') {
        if (commandAllowed(context)) {
            queue = [];
            //client.say(target, '/me the queue is now empty!');
            console.log('/me the queue is now empty!');
        }
    }
    else {
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
  
    if (opts['channels'].includes(context['username'])) {
      return true
    }
    if (context['user-type'] === 'mod') {
      return true
    }
    return false;
}