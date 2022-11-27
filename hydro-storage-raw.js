const axios = require('axios');
const luxon = require('luxon');
const fs = require('fs');

let markets = process.argv.slice(2);
markets = markets.length > 0 ? markets : ['de']

markets.forEach((market) => {
  axios.get(`https://www.energy-charts.info/charts/filling_level/raw_data/${market}/year_storage.json`)
    .then(response => response.data[0].values)
    .then(values => {
      console.log(market);

      const marketKey = market.toUpperCase() + '-Storage hydro';

      const format = values
        .map(([ms, y]) => ({ x: luxon.DateTime.fromMillis(ms), [marketKey]: y / 1000 }))
        .filter(p => !Object.keys(p).filter(k => k !== 'x').every(k => p[k] === 0))

      fs.writeFileSync(`scrape/raw/energy-hydrostorage-${market}.json`, JSON.stringify(format, null, 2));
    })
})
