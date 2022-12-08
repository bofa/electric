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

markets.forEach((market, marketIndex) => {
  let importData = [];
  try {
    importData = require(`./scrape/raw/energy-charts-${market}.json`);
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
  const weeks = Array(now.year - startDateRequested.year + 1).fill().map((_, i) => startDateRequested.year + i)
    .filter(year => year >= startDate.year - 1)
    .map((year, yearIndex, yearArray) => new Promise(resolve => setTimeout(resolve, 350 * (yearArray.length*marketIndex + yearIndex))).then(() =>
      axios.get(`https://www.energy-charts.info/charts/power/data/${market}/year_${year}.json`)
        .then(response => response.data)
        .then(sources => {
          // const date = new luxon.DateTime(sources[0].xAxisValues[0])
          console.log(market, year);

          const marketKey = market.toUpperCase() + '-';
          const individualSource = sources.map(source => source.data.map(y => ({ [marketKey + source.name.en]: y })))
          const merge = individualSource[0].map((_, i) => ({
              x: luxon.DateTime.fromMillis(sources[0].xAxisValues[i]),
              ...individualSource.map(source => source[i]).reduce((merge, source) => ({ ...merge, ...source}), {})
            }))
            .filter(p => p.x.minute === 0)

          return merge;
        }))
        .catch(error => {
          if (error.response) {
            console.warn('Error', error.response?.status, error.request?.path);
            return [];
          }
          
          console.warn('Error', market, year);
          // throw error;
          return [];
        })
    )

  Promise.all(weeks)
    .then(weeks => {
      const flat = weeks
        .flat()
        .concat(importData)
        .filter(p => p.x.minute === 0)

      const unique = uniq(flat, 'x')
        .sort((a, b) => a.x - b.x);

      fs.writeFileSync(`scrape/raw/energy-charts-${market}.json`, JSON.stringify(unique, null, 2));
      
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
