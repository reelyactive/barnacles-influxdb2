/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const { InfluxDB, Point } = require('@influxdata/influxdb-client');


const DEFAULT_INFLUX_URL = 'http://localhost:8086';
const DEFAULT_INFLUX_ORG = 'reelyActive';
const DEFAULT_PRINT_ERRORS = false;
const DEFAULT_RADDEC_OPTIONS = { includePackets: false };
const DEFAULT_DYNAMB_OPTIONS = {};
const DEFAULT_EVENTS_TO_STORE = { raddec: DEFAULT_RADDEC_OPTIONS,
                                  dynamb: DEFAULT_DYNAMB_OPTIONS };
const SUPPORTED_EVENTS = [ 'raddec', 'dynamb' ];
const RADDEC_BUCKET = 'raddec';
const DYNAMB_BUCKET = 'dynamb';


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

      this.influxDB = new InfluxDB({ url, token });
      this.dynambWriteClient = this.influxDB.getWriteApi(org, DYNAMB_BUCKET);
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
}


/**
 * Handle the given dynamb by storing it in Elasticsearch.
 * @param {BarnaclesElasticsearch} instance The BarnaclesElasticsearch instance.
 * @param {Object} dynamb The dynamb data.
 */
function handleDynamb(instance, dynamb) {
  let dynambOptions = instance.eventsToStore['dynamb'];
}


module.exports = BarnaclesInfluxDB2;
