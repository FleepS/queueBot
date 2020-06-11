var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:broadcaster', function(req, res, next) {
  let broadcaster = req.params.broadcaster;
  let channel = channels.find((element) => element["channel"] == broadcaster);
  
  let render = {
    channel: channel
  };
  console.log("- render -");
  console.log(render);

  res.render('channels', render);
});

module.exports = router;
