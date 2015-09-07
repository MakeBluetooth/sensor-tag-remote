var SensorTag = require('sensortag');
var robot = require('robotjs');

SensorTag.discover(function(sensorTag) {
  console.log("Found " + sensorTag);

  sensorTag.connectAndSetUp(function(error) {
    sensorTag.notifySimpleKey();
  });

  sensorTag.on('simpleKeyChange', function(left, right) {
    if (right) {
      robot.keyTap('right');
    } else if (left) {
      robot.keyTap('left');
    }
  });

});
