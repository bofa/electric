const axios = require('axios');
const luxon = require('luxon');
const fs = require('fs');

let markets = process.argv.slice(2);
markets = markets.length > 0 ? markets : ['de']

markets.forEach((market, marketIndex) => {
  let importData = [];
  try {
    importData = require(`./scrape/raw/production-${market}.json`);
  } catch {}
  importData.forEach(p => p.x = luxon.DateTime.fromISO(p.x))

  const marketLabel = market.toUpperCase();

  function uniq(a, key) {
    var seen = {};
    return a.filter(function(item) {
      return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
    });
  }

  // const startDate = luxon.DateTime.fromISO('2020-01-01')
  const startDate = importData.length === 0
    ? luxon.DateTime.fromISO('2020-01-01')
    : luxon.DateTime.fromISO(importData.at(-1).x);

  const now = luxon.DateTime.now();
  const weeks = [
    Array(53).fill().map((_, i) => ({ year: 2019, week: i+1 })),
    Array(53).fill().map((_, i) => ({ year: 2020, week: i+1 })),
    Array(53).fill().map((_, i) => ({ year: 2021, week: i+1 })),
    Array(53).fill().map((_, i) => ({ year: 2022, week: i+1 })),
  ].flat()
    .filter(week => week.year > startDate.year || (week.year === startDate.year && week.week >= startDate.weekNumber - 3))
    .filter(week => week.year < now.year || (week.year === now.year && week.week <= now.weekNumber + 1))
    .map(week => ({ year: week.year, week: String(week.week).padStart(2, '0') }))
    .map((weekObj, delay, weekArray) => new Promise(resolve => setTimeout(resolve, 350 * (weekArray.length*marketIndex + delay))).then(() =>
      axios.get(`https://www.energy-charts.info/charts/power/data/${market}/week_${weekObj.year}_${weekObj.week}.json`)
        .then(response => response.data)
        .then(sources => {
          // const date = new luxon.DateTime(sources[0].xAxisValues[0])
          console.log(market, weekObj);

          const individualSource = sources.map(source => source.data.map(y => ({ [marketLabel + '-' + source.name.en]: y })))
          const merge = individualSource[0].map((_, i) => ({
              x: luxon.DateTime.fromMillis(sources[0].xAxisValues[i]),
              ...individualSource.map(source => source[i]).reduce((merge, source) => ({ ...merge, ...source}), {})
            }))
            .filter(p => p.x.minute === 0)

          return merge;
        }))
        .catch(error => {
          console.warn('Error', error.response?.status, error.request?.path);
          return [];
        })
    )

  Promise.all(weeks)
    .then(weeks => {
      const flat = weeks
        .flat()
        .concat(importData)

      const unique = uniq(flat, 'x')
        .sort((a, b) => a.x - b.x);

      fs.writeFileSync(`scrape/raw/production-${market}.json`, JSON.stringify(unique, null, 2));
      
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
