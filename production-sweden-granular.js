const axios = require('axios');
const fs = require('fs');
const importData = require('./scrape/production-sweden-granular.json');
const luxon = require('luxon');

function uniq(a, key) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}

const productionTypes = [
  { key: 'KK', name: 'SE-nuclear' },
  { key: 'SE', name: 'SE-solar' },
  { key: 'OK', name: 'SE-misc' },
  // { key: 'OP', name: 'SE-unspecificed' },
  { key: 'VA', name: 'SE-hydro' },
  { key: 'VI', name: 'SE-wind' },
]

const fetchDaysBack = 10;
const too = luxon.DateTime.now();
const from = too.minus({ days: fetchDaysBack });

const calls$ = productionTypes
  .map(type => axios.get('https://mimer.svk.se/ProductionConsumption/DownloadText', { params: {
    PeriodFrom: from.toISO(), // '01%2F01%2F2020%2000%3A00%3A00',
    PeriodTo: too.toISO(),
    ConstraintAreaId: 'SN0', 
    ProductionSortId: type.key
  }}))

Promise.all(calls$)
  .then(calls => calls.map(response => response.data
    .split('\n')
    .slice(1, -2)
    .map(row => row.split(';'))
    .map(row => ({
      x: row[0].replace(' ', 'T') + ':00',
      y: row[1] !== '0'
        ? Math.round(Number(row[1]?.replace(',', '.')) / 1000 )
        : NaN
    }))
  ))
  .then(calls => calls[0].map((p, rowIndex) => ({
    x: p.x,
    ...productionTypes.reduce((obj, type, typeIndex) => ({ ...obj, [type.name]: calls[typeIndex][rowIndex].y }), {})
  })))
  // .then(formatted => { console.log(formatted); return formatted })
  .then(formatted => {
    const merge = formatted
      .concat(importData)

    const unique = uniq(merge, 'x')
      .sort((a, b) => luxon.DateTime.fromISO(a.x) - luxon.DateTime.fromISO(b.x));

    fs.writeFileSync('scrape/production-sweden-granular.json', JSON.stringify(unique, null, 2))
  })