import axios from 'axios';
import { DateTime } from 'luxon';
import fs from 'fs';

let markets = process.argv.slice(2);
markets = markets.length > 0 ? markets : ['de']

markets.forEach((market, marketIndex) => {
  let importData: any[] = [];
  // try {
  //   importData = require(`./scrape/raw/energy-charts-${market}.json`);
  // } catch {}
  importData.forEach(p => p.x = DateTime.fromISO(p.x))

  // const startDate = luxon.DateTime.fromISO('2020-01-01')

  const startDateRequested = DateTime.fromISO('2015-01-01')
  const startDateImport = DateTime.fromISO(importData.at(0)?.x);
  const endDateImport = DateTime.fromISO(importData.at(-1)?.x);

  const startDate = startDateImport.isValid && startDateImport <= startDateRequested.plus({ days: 1 })
    ? endDateImport
    : startDateRequested;

  const now = DateTime.now();
  const weeks = Array(now.year - startDateRequested.year + 1).fill(0).map((_, i) => startDateRequested.year + i)
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
              x: DateTime.fromMillis(sources[0].xAxisValues[i]),
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

      fs.writeFileSync(`scrape/raw/energy-charts-${market}.json`, JSON.stringify(unique));
    })
})


function uniq(a, key) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  }); 
}