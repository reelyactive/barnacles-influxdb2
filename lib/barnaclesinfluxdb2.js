/**
 * Copyright reelyActive 2023-2024
 * We believe in an open Internet of Things
 */


const { InfluxDB, Point } = require('@influxdata/influxdb-client');


const DEFAULT_INFLUX_URL = 'http://localhost:8086';
const DEFAULT_INFLUX_ORG = 'reelyActive';
const DEFAULT_INFLUX_BUCKET = 'pareto-anywhere';
const DEFAULT_PRINT_ERRORS = false;
const DEFAULT_RADDEC_OPTIONS = { includePackets: false };
const DEFAULT_DYNAMB_OPTIONS = {};
const DEFAULT_EVENTS_TO_STORE = { raddec: DEFAULT_RADDEC_OPTIONS,
                                  dynamb: DEFAULT_DYNAMB_OPTIONS };
const SUPPORTED_EVENTS = [ 'raddec', 'dynamb' ];
const RADDEC_MEASUREMENT = 'raddec';
const DYNAMB_MEASUREMENT = 'dynamb';


/**
 * BarnaclesInfluxDB2 Class
 * Detects events and writes to InfluxDB2.
 */
class BarnaclesInfluxDB2 {

  /**
   * BarnaclesInfluxDB2 constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};

    this.printErrors = options.printErrors || DEFAULT_PRINT_ERRORS;
    this.eventsToStore = {};
    let eventsToStore = options.eventsToStore || DEFAULT_EVENTS_TO_STORE;

    for(const event in eventsToStore) {
      let isSupportedEvent = SUPPORTED_EVENTS.includes(event);

      if(isSupportedEvent) {
        self.eventsToStore[event] = eventsToStore[event] ||
                                    DEFAULT_EVENTS_TO_STORE[event];
      }
    }

    // The (provided) InfluxDB2 client has already been instantiated
    if(options.client) {
      this.client = options.client;
    }
    // Create client using the provided or default url and token
    else {
      let url = options.url || DEFAULT_INFLUX_URL;
      let token = options.token || process.env.INFLUXDB_TOKEN;
      let org = options.org || DEFAULT_INFLUX_ORG;
      let bucket = options.bucket || DEFAULT_INFLUX_BUCKET;

      this.influxDB = new InfluxDB({ url, token });
      this.writeClient = this.influxDB.getWriteApi(org, bucket, 'ns');
    }
  }

  /**
   * Handle an outbound event.
   * @param {String} name The outbound event name.
   * @param {Object} data The outbound event data.
   */
  handleEvent(name, data) {
    let self = this;
    let isEventToStore = self.eventsToStore.hasOwnProperty(name);

    if(isEventToStore) {
      switch(name) {
        case 'raddec':
          return handleRaddec(self, data);
        case 'dynamb':
          return handleDynamb(self, data);
      }
    }
  }
}


/**
 * Handle the given raddec by storing it in Elasticsearch.
 * @param {BarnaclesElasticsearch} instance The BarnaclesElasticsearch instance.
 * @param {Object} raddec The raddec data.
 */
function handleRaddec(instance, raddec) {
  let raddecOptions = instance.eventsToStore['raddec'];

  // TODO: store raddecs in InfluxDB???
}


/**
 * Handle the given dynamb by storing it in Elasticsearch.
 * @param {BarnaclesElasticsearch} instance The BarnaclesElasticsearch instance.
 * @param {Object} dynamb The dynamb data.
 */
function handleDynamb(instance, dynamb) {
  let dynambOptions = instance.eventsToStore['dynamb'];
  let point = new Point(DYNAMB_MEASUREMENT)
                  .tag('deviceId', dynamb.deviceId)
                  .tag('deviceIdType', dynamb.deviceIdType)
                  .timestamp(new Date(dynamb.timestamp));

  for(const property in dynamb) {
    let value = dynamb[property];

    switch(property) {
      // Floats
      case 'amperage':
      case 'angleOfRotation':
      case 'temperature':
      case 'batteryPercentage':
      case 'batteryVoltage':
      case 'distance':
      case 'elevation':
      case 'heading':
      case 'heartRate':
      case 'illuminance':
      case 'pressure':
      case 'relativeHumidity':
      case 'speed':
      case 'temperature':
      case 'voltage':
        point.floatField(property, value);
        break;
      // Booleans based on an array
      case 'isButtonPressed':
      case 'isContactDetected':
      case 'isMotionDetected':
        if(Array.isArray(value)) {
          let isAnyTrue = value.reduce((a, b) => a || b, false);
          point.booleanField(property, isAnyTrue);
        }
        break;
      // Unsigned integers
      case 'numberOfOccupants':
      case 'txCount':
      case 'uptime':
        point.uintField(property, value);
        break;
      // Unsigned integers based on sum of an array
      case 'passageCounts':
        if(Array.isArray(value)) {
          let sum = value.reduce((a, b) => a + b, 0);
          point.uintField(property, sum);
        }
        break;
      // Floats based on RMS of an array
      case 'acceleration':
      case 'amperages':
      case 'magneticField':
      case 'pressures':
      case 'temperatures':
      case 'voltages':
        if(Array.isArray(value)) {
          let sumOfSquares = 0;
          let numberOfElements = 0;

          value.forEach(element => {
            if(Number.isFinite(element)) {
              sumOfSquares += (element * element);
              numberOfElements++;
            }
          });

          if(numberOfElements === 0) break;

          let rms = Math.sqrt(sumOfSquares / numberOfElements);
          point.floatField(property, rms);
        }
        break;
    }
  }

  instance.writeClient.writePoint(point);
}


module.exports = BarnaclesInfluxDB2;
