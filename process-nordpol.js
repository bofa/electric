const axios = require('axios');
const fs = require('fs');
const luxon = require('luxon');

function uniq(a, key) {
  var seen = {};
  return a.filter(function(item) {
      return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}

const days = 2 * 365;
data$ = Array(days).fill().map((_, i) => {
  const endTime = luxon.DateTime.now().minus({ days: i - 2 }).toFormat('dd-MM-yyyy');

  return new Promise(resolve => setTimeout(resolve, 250 * i))
    .then(() => axios.get(`https://www.nordpoolgroup.com/api/marketdata/page/10?currency=,EUR,EUR,EUR&endDate=${endTime}`))
    // .then(() => axios.get(`https://www.nordpoolgroup.com/api/marketdata/page/29?currency=,,,EUR&endDate=${endTime}`))
    .then(response => response.data.data.Rows)
    .then(rows => {
      const structure = rows[0].Columns.map(c => c.CombinedName);

      const output = rows.map(row => ({
          t: row.StartTime,
          ...structure
            .map((area, index) => [area, Number(row.Columns[index].Value.replace(',','.'))])
            .reduce((obj, area) => ({ ...obj, [area[0]]: area[1]}), {})
        }))
        .filter(p => !Number.isNaN(p.SYS))

      return output;
    })
})

data$.forEach((r, i) => r.then(() => console.log(i)));

Promise.all(data$).then(response => {
  const flat = response.flat();
  const unique = uniq(flat, 't')
    .sort((a, b) => luxon.DateTime.fromISO(a.t) - luxon.DateTime.fromISO(b.t));

  fs.writeFileSync('src/data.json', JSON.stringify(unique, null, 2));
})
  