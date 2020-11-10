var express = require('express');
var router = express.Router();
var bot = require("../bin/bot");

/* GET users listing. */
router.get('/:broadcaster', function(req, res, next) {
  let broadcaster = req.params.broadcaster;
  let channel = channels.find((element) => element["channel"] == broadcaster);
  
  if (typeof channel === 'undefined') {
    return res.status(302).redirect('/');
  }

  let render = {
    channel: channel,
    local_url: process.env.LOCAL_URL,
  };

  let channelAssetsFolder = `./public/vendor/channels/${broadcaster}`;
  if (fs.existsSync(channelAssetsFolder)) {
    let icon = channelAssetsFolder.concat('/', `${channel.icon}`);
    if (fs.existsSync(icon)) {
      render['channel']['icon'] = `../../vendor/channels/${broadcaster}/${channel.icon}`;
    }
  } else {
    render['channel']['icon'] = null;
  }

  res.render('channels', render);
});

router.get('/:broadcaster/next', function (req, res, next) {
  let broadcaster = req.params.broadcaster;
  let channel = channels.find((element) => element["channel"] == broadcaster);
  
  if (typeof channel === 'undefined') {
    return res.status(302).redirect('/');
  }

  let user = "";
  if (channel.queue.length > 0) user = channel.queue[0];
  let render = {
    local_url: process.env.LOCAL_URL,
    broadcaster: broadcaster,
    user: user,
    layout: null
  }
  res.render('next_queue', render );
});


// api routes
router.get('/:broadcaster/api/list', function (req, res, next) {
  let broadcaster = req.params.broadcaster;
  let channel = channels.find((element) => element["channel"] == broadcaster);
  
  if (typeof channel === 'undefined') {
    return res.status(302).redirect('/');
  }

  let queueWithSub = [];

  for(user of channel.queue){
    let sub = false;
    if (bot.belongsToSub(channel, user)) {
      sub = true;
    }
    queueWithSub.push({
      name: user,
      sub: sub
    });
  }


  let render = {
    queue: queueWithSub,
    subBadgePath: getAssetPath(broadcaster, channel.subBadge)
  };

  res.send(render);

});


router.get('/:broadcaster/api/next', function (req, res, next) {
  let broadcaster = req.params.broadcaster;
  let channel = channels.find((element) => element["channel"] == broadcaster);
  let data = {
    user1: null,
    user2: null,
    user3: null,
    subBadge1: null,
    subBadge2: null,
    subBadge3: null
  };
  
  if (channel.queue.length > 0) {
    data['user1'] = channel.queue[0];
    if (channel.queue.length > 1) {
    data['user2'] = channel.queue[1];
    }
    if (channel.queue.length > 2) {
    data['user3'] = channel.queue[2];
    }
    if (bot.belongsToSub(channel, data['user1']) || true ) {
      let path = getAssetPath(broadcaster, channel.subBadge)
      console.log("PATH" + path);
      if (path) {
        let icon = `<img src=${path}>`;
        data['subBadge1'] = path;
      }
    }
    if (bot.belongsToSub(channel, data['user2']) || true ) {
      let path = getAssetPath(broadcaster, channel.subBadge)
      if (path) {
        let icon = `<img src=${path}>`;
        data['subBadge2'] = path;
      }
    }
    if (bot.belongsToSub(channel, data['user3']) || true ) {
      let path = getAssetPath(broadcaster, channel.subBadge)
      if (path) {
        let icon = `<img src=${path}>`;
        data['subBadge3'] = path;
      }
    }
  }
  res.send(data);
});


function getAssetPath(broadcaster, element) {
  let channel = channels.find((element) => element["channel"] == broadcaster);

  let channelAssetsFolder = `./public/vendor/channels/${broadcaster}`;
  if (fs.existsSync(channelAssetsFolder)) {
    let icon = channelAssetsFolder.concat('/', `${element}`);
    if (fs.existsSync(icon)) {
      return `../../vendor/channels/${broadcaster}/${element}`;
    }
  }
  
  return null;
}

module.exports = router;
