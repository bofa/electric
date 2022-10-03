const axios = require('axios');
const fs = require('fs');
const luxon = require('luxon');

function uniq(a, key) {
  var seen = {};
  return a.filter(function(item) {
      return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}

data$ = Array(365).fill().map((_, i) => {
  const endTime = luxon.DateTime.now().minus({ days: i }).toFormat('dd-MM-yyyy');

  return new Promise(resolve => setTimeout(resolve, 250 * i))
    .then(() => axios.get(`https://www.nordpoolgroup.com/api/marketdata/page/29?currency=,,,EUR&endDate=${endTime}`))
    .then(r => r.data.data.Rows.map(row => ({ t: row.StartTime, y: Number(row.Columns[2].Value.replace(',','.')) })))
})

data$.forEach((r, i) => r.then(() => console.log(i)));

Promise.all(data$).then(response => {
  const flat = response.flat();
  const unique = uniq(flat, 't')

  fs.writeFileSync('data.json', JSON.stringify(unique, null, 2));
})
  