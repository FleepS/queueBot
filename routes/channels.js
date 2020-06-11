var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:broadcaster', function(req, res, next) {
  let broadcaster = req.params.broadcaster;
  let channel = channels.find((element) => element["channel"] == broadcaster);
  
  if (typeof channel === 'undefined') {
    return res.status(302).redirect('/');
  }

  let render = {
    channel: channel,
  };

  let channelAssetsFolder = `./public/vendor/channels/${broadcaster}`;
  if (fs.existsSync(channelAssetsFolder)) {
    let icon = channelAssetsFolder.concat('/', `${channel.icon}`);
    if (fs.existsSync(icon)) {
      render['channel']['icon'] = `../vendor/channels/${broadcaster}/${channel.icon}`;;
    }
  } else {
    render['channel']['icon'] = null;
  }

  res.render('channels', render);
});

module.exports = router;
