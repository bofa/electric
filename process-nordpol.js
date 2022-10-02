const axios = require('axios');
const fs = require('fs');

axios.get('https://www.nordpoolgroup.com/api/marketdata/chart/29?currency=,,,EUR')
  .then(r => r.data.data.Rows.map(row => ({ t: row.StartTime, y: Number(row.Columns[3].Value.replace(',','.')) })))
  .then(r => fs.writeFileSync('data.json', JSON.stringify(r, { indent: 2 })))
  