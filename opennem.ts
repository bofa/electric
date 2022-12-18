import axios from 'axios';
import fs from 'fs';
import { DateTime, Interval } from 'luxon';

function uniq(a: any, key: string) {
  var seen = {} as any;
  return a.filter(function(item: any) {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}

interface History {
  start: string;
  last: string;
  interval: string;
  data: number[];
}

interface Datum {
  id: string;
  type: string;
  code: string;
  network: string;
  region: string;
  data_type: string;
  units: string;
  history: History;
  fuel_tech: string;
}

interface OpennemDTO {
  type: string;
  version: string;
  network: string;
  code: string;
  region: string;
  created_at: string;
  data: Datum[];
}

const market = 'NS';

let importData: any[] = [];
try {
  importData = require(`./scrape/raw/open-nem-${market}.json`);
} catch {}
importData.forEach(p => p.x = DateTime.fromISO(p.x))

// const startDate = DateTime.fromISO('2021-01-01');
const now = DateTime.now();
const startDate = now.minus({weeks: 15 });

const intervals = Interval
  .fromDateTimes(startDate, now)
  .splitBy({ week: 1 })
  .map(interval => interval.start );

// console.log('Weeks', intervals);

const data$ = intervals.map((date, dateIndex) => new Promise(resolve => setTimeout(resolve, 350 * dateIndex))
  .then(() => console.log(Math.round(100 * dateIndex/intervals.length), date.year, date.weekNumber))
  .then(() => axios.get(`https://data.opennem.org.au/v3/stats/historic/weekly/NEM/NSW1/year/${date.year}/week/${date.weekNumber}.json`))
  .then(response => response.data as OpennemDTO)
  .then(data => data.data
    .map(source => {
      const start = DateTime.fromISO(source.history.start);
      return {
        ...source,
        region: data.region,
        // type: source.fuel_tech,
        data: source.history.data.map((y, i) => ({
          x: start.plus({ minutes: Number(source.history.interval.replace('m', '')) * i}),
          y
        }))
        .filter(p => p.x.minute === 0)
      }
    })
  )
);

Promise.all(data$).then(response => {
  const powerSources = response.map(sources => sources.filter(source => source.type === 'power'))

  const aggrageted = powerSources[0]
  .map(source => ({
    ...source,
    data: response.reduce((aggregate, weekData) => aggregate.concat(
      weekData.find(source2 => source2.fuel_tech === source.fuel_tech)?.data || [])
      , [] as { x: DateTime, y: number }[])
  }))
  .map(source => source.data.map(p => ({ x: p.x, [market + '-' + source.fuel_tech]: p.y })))
  .reduce((agg, source) => agg.map((p, i) => ({ ...p, ...source[i] })))
  .concat(importData)
  .sort((a: any, b: any) => a.x - b.x)

  // console.log('response', response[0]);
  // console.log('response', aggrageted);

  const uniqSeries = uniq(aggrageted, 'x');

  fs.writeFileSync(`scrape/raw/open-nem-${market}.json`, JSON.stringify(uniqSeries, null, 2));
})
