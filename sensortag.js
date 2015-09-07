var noble = require('noble');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning(); // any service UUID
  } else {
    console.log('Please power-on the Bluetooth Adapter.');
  }
});

noble.on('discover', function(peripheral) {

  var localName = peripheral.advertisement.localName;

  // find SensorTag based on local name
  if (localName && localName.match(/Sensor/)) {
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

function onDisconnect() {
  console.log('Peripheral disconnected!');
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

function onCharacteristicData(data, isNotification) {
  switch (data[0]) {
  case 0:
    console.log("No buttons are pressed");
    break;
  case 1:
    console.log("Right button is pressed");
    break;
  case 2:
    console.log("Left button is pressed");
    break;
  case 3:
    console.log("Both buttons are pressed");
    break;
  default:
    console.log("Error " + data[0]);
  }
}
