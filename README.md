barnacles-influxdb2
===================

__barnacles-influxdb2__ writes ambient IoT timeseries data to InfluxDB v2.

![Overview of barnacles-influxdb2](https://reelyactive.github.io/barnacles-influxdb2/images/overview.png)

__barnacles-influxdb2__ ingests a real-time stream of _dynamb_ objects from [barnacles](https://github.com/reelyactive/barnacles/) which it writes to a given InfluxDB v2 instance.  It couples seamlessly with reelyActive's [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source IoT middleware.

__barnacles-influxdb2__ is a lightweight [Node.js package](https://www.npmjs.com/package/barnacles-influxdb2) that can run on resource-constrained edge devices as well as on powerful cloud servers and anything in between.


Pareto Anywhere integration
---------------------------

A common application of __barnacles-influxdb2__ is to write IoT data from [pareto-anywhere](https://github.com/reelyactive/pareto-anywhere) to an InfluxDB v2 timeseries database.  Simply follow our [Create a Pareto Anywhere startup script](https://reelyactive.github.io/diy/pareto-anywhere-startup-script/) tutorial using the script below:

```javascript
#!/usr/bin/env node

const ParetoAnywhere = require('../lib/paretoanywhere.js');

// Edit the options to specify the InfluxDB v2 instance
const BARNACLES_INFLUXDB2_OPTIONS = {};

// ----- Exit gracefully if the optional dependency is not found -----
let BarnaclesInfluxDB2;
try {
  BarnaclesInfluxDB2 = require('barnacles-influxdb2');
}
catch(err) {
  console.log('This script requires barnacles-influxdb2.  Install with:');
  console.log('\r\n    "npm install barnacles-influxdb2"\r\n');
  return console.log('and then run this script again.');
}
// -------------------------------------------------------------------

let pa = new ParetoAnywhere();
pa.barnacles.addInterface(BarnaclesInfluxDB2, BARNACLES_INFLUXDB2_OPTIONS);
```


Options
-------

__barnacles-influxdb2__ supports the following options:

| Property      | Default                    | Description                    | 
|:--------------|:---------------------------|:-------------------------------|
| url           | "http://localhost:8086"    | Local InfluxDB2 instance       |
| token         | process.env.INFLUXDB_TOKEN | Secret token                   |
| org           | "reelyActive"              | Organisation                   |
| bucket        | "pareto-anywhere"          | Bucket                         |

To set the INFLUXDB_TOKEN as an environment variable in Linux:

    export INFLUXDB_TOKEN=pasteTokenHere


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.


License
-------

MIT License

Copyright (c) 2023 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
