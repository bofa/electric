const axios = require('axios');
const fs = require('fs');

const productionTypes = [
  { key: 'KK', name: 'SE-nuclear' },
  { key: 'SE', name: 'SE-solar' },
  { key: 'OK', name: 'SE-misc' },
  // { key: 'OP', name: 'SE-unspecificed' },
  { key: 'VA', name: 'SE-hydro' },
  { key: 'VI', name: 'SE-wind' },
]

const calls$ = productionTypes
.map(type => axios.get('https://mimer.svk.se/ProductionConsumption/DownloadText?PeriodFrom=01%2F01%2F2020%2000%3A00%3A00&PeriodTo=10%2F22%2F2022%2000%3A00%3A00&ConstraintAreaId=SN0&ProductionSortId=' + type.key))
// axios.get('https://mimer.svk.se/ProductionConsumption/DownloadText?PeriodFrom=10%2F15%2F2022%2000%3A00%3A00&PeriodTo=10%2F22%2F2022%2000%3A00%3A00&ConstraintAreaId=SN0&ProductionSortId=SE')

Promise.all(calls$)
  .then(calls => calls.map(response => response.data
    .split('\n')
    .slice(1, -2)
    .map(row => row.split(';'))
    .map(row => ({
      x: row[0].replace(' ', 'T') + ':00',
      y: Math.round(Number(row[1]?.replace(',', '.')) / 1000 )
    }))
  ))
  .then(calls => calls[0].map((p, rowIndex) => ({
    x: p.x,
    ...productionTypes.reduce((obj, type, typeIndex) => ({ ...obj, [type.name]: calls[typeIndex][rowIndex].y }), {})
  })))
  // .then(console.log)
  .then(formatted => fs.writeFileSync('scrape/production-sweden-granular.json', JSON.stringify(formatted, null, 2)))