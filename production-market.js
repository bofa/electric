const axios = require('axios');
const luxon = require('luxon');
const fs = require('fs');

const market = process.argv[2] || 'de';

let importData = [];
try {
  importData = require(`./scrape/production-${market}.json`);
} catch {}

const marketLabel = market.toUpperCase();
const keepKeys = [
  'x',
  marketLabel + '-Import Balance',
  marketLabel + '-Nuclear',
  marketLabel + '-Hydro Run-of-River',
  marketLabel + '-Biomass',
  marketLabel + '-Fossil brown coal / lignite',
  marketLabel + '-Fossil hard coal',
  marketLabel + '-Fossil oil',
  marketLabel + '-Fossil gas',
  marketLabel + '-Geothermal',
  marketLabel + '-Hydro water reservoir',
  marketLabel + '-Hydro pumped storage',
  marketLabel + '-Wind offshore',
  marketLabel + '-Wind onshore',
  marketLabel + '-Solar',
]

importData.forEach(p => p.x = luxon.DateTime.fromISO(p.x))

function uniq(a, key) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}

const startDate = importData.length === 0 ? luxon.DateTime.fromISO('2020-01-01') : luxon.DateTime.fromISO(importData.at(-1).x);

const now = luxon.DateTime.now();
const weeks = [
  Array(52).fill().map((_, i) => ({ year: '2020', week: String(i+1).padStart(2, '0') })),
  Array(52).fill().map((_, i) => ({ year: '2021', week: String(i+1).padStart(2, '0') })),
  Array(52).fill().map((_, i) => ({ year: '2022', week: String(i+1).padStart(2, '0') })),
].flat()
  .filter(week => week.year >= startDate.year && week.week >= startDate.weekNumber - 3)
  .filter(week => week.year <= now.year && week.week <= now.weekNumber + 1)
  .map((weekObj, delay) => new Promise(resolve => setTimeout(resolve, 350 * delay)).then(() =>
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
        console.warn('Error', error.response.status, error.request.path);
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

    const filtered = unique.map(p => keepKeys.reduce((obj, key) => ({ ...obj, [key]: p[key] }), {}))

    fs.writeFileSync(`scrape/production-${market}.json`, JSON.stringify(unique, null, 2));
    fs.writeFileSync(`scrape/production-${market}-filterd.json`, JSON.stringify(filtered, null, 2));
  })