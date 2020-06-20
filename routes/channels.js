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
  console.log("on api/list");
  let broadcaster = req.params.broadcaster;
  let channel = channels.find((element) => element["channel"] == broadcaster);
  console.log("broadcaster");
  console.log(broadcaster);
  console.log("channel");
  console.log(channel);
  
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
    user: null,
    subBadge: null
  };
  
  if (channel.queue.length > 0) {
    data['user'] = channel.queue[0];
    if (bot.belongsToSub(channel, data['user'])) {
      let path = getAssetPath(broadcaster, channel.subBadge)
      if (path) {
        let icon = `<img src=${path}>`;
        data['subBadge'] = path;
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
