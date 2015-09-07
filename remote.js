var noble = require('noble');
var robot = require('robotjs');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning(); // any service UUID
  } else {
    console.log('Please power-on the Bluetooth Adapter.');
  }
});

noble.on('discover', function(peripheral) {

  var localName = peripheral.advertisement.localName;

  // The SensorTag doesn't advertise any services, so filter based on local name
  if (localName && localName.match(/Sensor/)) {

    // we found a SensorTag, stop scanning
    noble.stopScanning();

    console.log('Attempting to connect to ' + localName);

    connectAndSetUpSensorTag(peripheral);
  }
});

function connectAndSetUpSensorTag(peripheral) {

  peripheral.connect(function(error) {
    console.log('Connected to ' + peripheral.advertisement.localName);
    if (error) {
      console.log('There was an error connecting ' + error);
      return;
    }

    var serviceUUIDs = ['FFE0'];
    var characteristicUUIDs = ['FFE1'];

    peripheral.discoverSomeServicesAndCharacteristics(
    serviceUUIDs, characteristicUUIDs, onServicesAndCharacteristicsDiscovered);
  });

  // attach disconnect handler
  peripheral.on('disconnect', onDisconnect);
}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {

  if (error) {
    console.log('Error discovering services and characteristics ' + error);
    return;
  }

  var characteristic = characteristics[0];

  // subscribe for notifications
  characteristic.notify(true);

  // called when notification state changes
  characteristic.on('notify', function(isNotifying) {
    if (isNotifying) {
      console.log('SensorTag remote is ready');
    }
  });

  // called when the data changes
  characteristic.on('data', onCharacteristicData);
}

function onDisconnect() {
  console.log('Peripheral disconnected!');
}

function onCharacteristicData(data, isNotification) {
  switch (data[0]) {
  case 1:
    console.log('right');
    robot.keyTap('right');
    break;
  case 2:
    console.log('left');
    robot.keyTap('left');
    break;
  }
}
