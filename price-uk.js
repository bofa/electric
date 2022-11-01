const axios = require('axios');
const fs = require('fs');
const luxon = require('luxon');
const importData = require('./scrape/price-uk.json');

function uniq(a, key) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}

const days = 10; // 3 * 365;
data$ = Array(days).fill().map((_, i) => {
  const endTime = luxon.DateTime.now().minus({ days: i - 2 }).toFormat('dd-MM-yyyy');

  return new Promise(resolve => setTimeout(resolve, 350 * i))
    .then(() => axios.get(`https://www.nordpoolgroup.com/api/marketdata/page/325?currency=,EUR,EUR,EUR&endDate=${endTime}`))
    .then(response => response.data.data.Rows)
    .then(rows => {
      const series = rows
        .slice(0, -3)
        .map((row, i) => ({
          x: luxon.DateTime.fromISO(row.StartTime, { zone: 'utc' }).plus({ hours: i }).toISO(),
          uk: Number(row.Columns[1].Value.replace(',', '.'))
        }))

      return series;
    })
})

data$.forEach((r, i) => r.then(() => console.log(i)));

Promise.all(data$).then(response => {
  const flat = response
    .flat()
    .concat(importData)

  const unique = uniq(flat, 'x')
    .sort((a, b) => luxon.DateTime.fromISO(a.x) - luxon.DateTime.fromISO(b.x));
    
    fs.writeFileSync('scrape/price-uk.json', JSON.stringify(unique, null, 2));

    // const from2021 = unique.filter(p => luxon.DateTime.fromISO(p.x).year === 2021);
    // fs.writeFileSync('src/data-uk2021.json', JSON.stringify(from2021, null, 2));
})
  