var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let maintenance_mode = "off";
  if ( process.env.MAINTENANCE_MODE === 'true' ) {
    maintenance_mode = "on";
  }
  
  res.render('index', { title: 'Express', maintenance_mode: maintenance_mode });
});

module.exports = router;
