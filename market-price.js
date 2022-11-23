const axios = require('axios');
const luxon = require('luxon');
const fs = require('fs');

let markets = process.argv.slice(2);
markets = markets.length > 0 ? markets : ['de']

function uniq(a, key) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}

// Local call for nordpool.
const days = 4; // 1 * 365;
nordpoolPromises = Array(days).fill().map((_, i) => {
  const endTime = luxon.DateTime.now().minus({ days: i - 2 }).toFormat('dd-MM-yyyy');

  return new Promise(resolve => setTimeout(resolve, 350 * i))
    .then(() => axios.get(`https://www.nordpoolgroup.com/api/marketdata/page/10?currency=,EUR,EUR,EUR&endDate=${endTime}`))
    // .then(() => axios.get(`https://www.nordpoolgroup.com/api/marketdata/page/29?currency=,,,EUR&endDate=${endTime}`))
    .then(response => response.data.data.Rows)
    .then(rows => {
      const structure = rows[0].Columns.map(c => c.CombinedName);

      const output = rows.map(row => ({
          x: luxon.DateTime.fromISO(row.StartTime),
          ...structure
            .map((area, index) => [area, Number(row.Columns[index].Value.replace(',','.'))])
            .reduce((obj, area) => ({ ...obj, [area[0] + '-Price']: area[1]}), {})
        }))
        .filter(p => !Number.isNaN(p.SYS))

      return output;
    })
})

const nordpool$ = Promise.all(nordpoolPromises).then(nord => nord.flat())

// Calls for energy-charts
markets.forEach((market, marketIndex) => {
  let importData = [];
  try {
    importData = require(`./scrape/raw/energy-price-${market}.json`);
  } catch {}
  importData.forEach(p => p.x = luxon.DateTime.fromISO(p.x))

  // const startDate = luxon.DateTime.fromISO('2020-01-01')

  const startDateRequested = luxon.DateTime.fromISO('2015-01-01')
  const startDateImport = luxon.DateTime.fromISO(importData.at(0)?.x);
  const endDateImport = luxon.DateTime.fromISO(importData.at(-1)?.x);

  const startDate = startDateImport.isValid && startDateImport <= startDateRequested.plus({ days: 1 })
    ? endDateImport
    : startDateRequested;

  const now = luxon.DateTime.now();
  const energyChartsCalls$ = Array(now.year - startDateRequested.year + 1).fill().map((_, i) => startDateRequested.year + i)
    .filter(year => year >= startDate.year - 1)
    .map((year, delay, weekArray) => new Promise(resolve => setTimeout(resolve, 350 * (weekArray.length*marketIndex + delay))).then(() =>
        axios.get(`https://www.energy-charts.info/charts/price_spot_market/data/${market}/year_${year}.json`)
        .then(response => response.data)
        .then(sources => {
          // const date = new luxon.DateTime(sources[0].xAxisValues[0])
          console.log(market, year);
          const marketData = sources
            .filter(s => Array.isArray(s.name))
            .map(s => ({
              name: s.name[0].en.match(/\(([^\)]+)\)/g)[0].slice(1, -1),
              data: s.data,
            }))

          const dates = sources[0].xAxisValues.map(d => luxon.DateTime.fromMillis(d));

          const inverted = dates.map((x, i) => ({
            x,
            ...marketData.reduce((obj, m) => ({ ...obj, [m.name + '-Price']: m.data[i] }), {})
          })).filter(p => p.x.minute === 0)

          return inverted;
        })
        .catch(error => {
          console.warn('Error', error.response?.status, error.request?.path);
          return [];
        })
    ))

  Promise.all([Promise.all(
    energyChartsCalls$).then(energyChartsCalls => energyChartsCalls.flat()),
    nordpool$
  ]).then(([energyChartsCalls, nordpool]) => {
      const keys = Object.keys(energyChartsCalls[0]).concat('x');
      const nordpoolFiltered = nordpool
        .map(p => keys.filter(k => k in p).map(k => [k, p[k]])
        .reduce((obj, p) => ({ ...obj, [p[0]]: p[1] }), {}))
        .filter(p => Object.keys(p).length > 1)

      const flat = energyChartsCalls
        .flat()
        // .concat(nordpoolFiltered)
        .concat(importData)
        .filter(p => p.x.minute === 0)

      const unique = uniq(flat, 'x')
        .sort((a, b) => a.x - b.x);

      fs.writeFileSync(`scrape/raw/energy-price-${market}.json`, JSON.stringify(unique, null, 2));
      
      // const filteredProduction = unique
      //   .filter(p => p.x.year >= 2020)
      //   .map(p => keepKeysProduction.reduce((obj, key) => ({ ...obj, [key]: p[key] }), {}))
      // fs.writeFileSync(`scrape/production-${market}.json`, JSON.stringify(filteredProduction, null, 2));

      // const filteredConsumption = unique
      //   .filter(p => p.x.year >= 2020)
      //   .map(p => keepKeysConsumption.reduce((obj, key) => ({ ...obj, [key[1]]: p[key[0]] }), {}))
      // fs.writeFileSync(`scrape/consumption-${market}.json`, JSON.stringify(filteredConsumption, null, 2));

      // const filteredExport = unique
      //   .filter(p => p.x.year >= 2020)
      //   .map(p => keepKeysExport.reduce((obj, key) => ({ ...obj, [key[1]]: -p[key[0]] }), { x: p.x }))
      // fs.writeFileSync(`scrape/export-${market}.json`, JSON.stringify(filteredExport, null, 2));
    })
})
