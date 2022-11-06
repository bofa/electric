const axios = require('axios');
const luxon = require('luxon');
const fs = require('fs');
const importData = require('./scrape/production-germany.json');

const keepKeys = [
  'x',
  'DE-Import Balance',
  'DE-Nuclear',
  'DE-Hydro Run-of-River',
  'DE-Biomass',
  'DE-Fossil brown coal / lignite',
  'DE-Fossil hard coal',
  'DE-Fossil oil',
  'DE-Fossil gas',
  'DE-Geothermal',
  'DE-Hydro water reservoir',
  'DE-Hydro pumped storage',
  'DE-Wind offshore',
  'DE-Wind onshore',
  'DE-Solar',
]

importData.forEach(p => p.x = luxon.DateTime.fromISO(p.x))

function uniq(a, key) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}

const now = luxon.DateTime.now();
// const weeks = [
//   Array(52).fill().map((_, i) => ({ year: '2020', week: String(i+1).padStart(2, '0') })),
//   Array(52).fill().map((_, i) => ({ year: '2021', week: String(i+1).padStart(2, '0') })),
//   Array(44).fill().map((_, i) => ({ year: '2022', week: String(i+1).padStart(2, '0') })),
// ]
const weeks = [[
  ({ year: '2022', week: String(now.weekNumber-2).padStart(2, '0') }),
  ({ year: '2022', week: String(now.weekNumber-1).padStart(2, '0') }),
  ({ year: '2022', week: String(now.weekNumber-0).padStart(2, '0') }),
]].flat()
  .map((weekObj, delay) => new Promise(resolve => setTimeout(resolve, 350 * delay)).then(() =>
    axios.get(`https://www.energy-charts.info/charts/power/data/de/week_${weekObj.year}_${weekObj.week}.json`)
      .then(response => response.data)
      .then(sources => {
        // const date = new luxon.DateTime(sources[0].xAxisValues[0])
        console.log('weekObj', weekObj);

        const individualSource = sources.map(source => source.data.map(y => ({ ['DE-' + source.name.en]: y })))
        const merge = individualSource[0].map((_, i) => ({
            x: luxon.DateTime.fromMillis(sources[0].xAxisValues[i]),
            ...individualSource.map(source => source[i]).reduce((merge, source) => ({ ...merge, ...source}), {})
          }))
          .filter(p => p.x.minute === 0)

        return merge;
      }))
  )

Promise.all(weeks)
  .then(weeks => {
    const flat = weeks
      .flat()
      .concat(importData)

    const unique = uniq(flat, 'x')
      .sort((a, b) => a.x - b.x);

    const filtered = unique.map(p => keepKeys.reduce((obj, key) => ({ ...obj, [key]: p[key] }), {}))

    fs.writeFileSync('scrape/production-germany.json', JSON.stringify(unique, null, 2));
    fs.writeFileSync('scrape/production-germany-filterd.json', JSON.stringify(filtered, null, 2));
  })