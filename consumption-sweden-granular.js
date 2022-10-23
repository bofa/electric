const axios = require('axios');
const fs = require('fs');
const importData = require('./scrape/consumption-sweden-granular.json');
const luxon = require('luxon');

function uniq(a, key) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}

const areas = [
  { key: 'SN1', name: 'SE1' },
  { key: 'SN2', name: 'SE2' },
  { key: 'SN3', name: 'SE3' },
  { key: 'SN4', name: 'SE4' },
]

const fetchDaysBack = 10;
const too = luxon.DateTime.now();
const from = too.minus({ days: fetchDaysBack });

// https://mimer.svk.se/ProductionConsumption/DownloadText
// ConstraintAreaId=SN0&ProductionSortId=TL&IsConsumption=True
const calls$ = areas
  .map(area => axios.get('https://mimer.svk.se/ProductionConsumption/DownloadText', { params: {
    PeriodFrom: from.toISO(), // '01%2F01%2F2020%2000%3A00%3A00',
    PeriodTo: too.toISO(),
    ConstraintAreaId: area.key, 
    ProductionSortId: 'TL',
    IsConsumption: 'True',
  }}))

Promise.all(calls$)
  .then(calls => calls.map(response => response.data
    .split('\n')
    .slice(1, -2)
    .map(row => row.split(';'))
    .map(row => ({
      x: row[0].replace(' ', 'T') + ':00',
      y: row[1] !== '0'
        ? Math.round(-Number(row[1]?.replace(',', '.')) / 1000 )
        : NaN
    }))
  ))
  .then(calls => calls[0].map((p, rowIndex) => ({
    x: p.x,
    ...areas.reduce((obj, area, typeIndex) => ({ ...obj, [area.name]: calls[typeIndex][rowIndex].y }), {})
  })))
  // .then(formatted => { console.log(formatted); return formatted })
  .then(formatted => {
    const merge = formatted
      .concat(importData)
    // const merge = formatted;

    const unique = uniq(merge, 'x')
      .sort((a, b) => luxon.DateTime.fromISO(a.x) - luxon.DateTime.fromISO(b.x));

    fs.writeFileSync('scrape/consumption-sweden-granular.json', JSON.stringify(unique, null, 2))
  })