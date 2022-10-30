const axios = require('axios');
const fs = require('fs');
const luxon = require('luxon');
const importData = require('./scrape/production-wind.json');

function uniq(a, key) {
  var seen = {};
  return a.filter(function(item) {
      return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}

const days = 10; // 3 * 365; // 10;
data$ = Array(days).fill().map((_, i) => {
  const endTime = luxon.DateTime.now().minus({ days: i }).toFormat('dd-MM-yyyy');

  return new Promise(resolve => setTimeout(resolve, 350 * i))
    .then(() => axios.get(`https://www.nordpoolgroup.com/api/marketdata/page/553?currency=,EUR,EUR,EUR&endDate=${endTime}`))
    .then(response => response.data.data.Rows)
    .then(rows => {
      const structure = rows[0].Columns.map(c => c.CombinedName);

      const output = rows.map(row => ({
          x: row.StartTime,
          ...structure
            .map((area, index) => [area, Number(row.Columns[index].Value.replace(',','.').replace(' ',''))])
            .reduce((obj, area) => ({ ...obj, [area[0]+'-wind']: area[1]}), {})
        }))
        .filter(p => !Number.isNaN(p.SYS))

      return output;
    })
})

data$.forEach((r, i) => r.then(() => console.log(i)));

Promise.all(data$).then(response => {
  const flat = response
    .flat()
    .concat(importData)

  const unique = uniq(flat, 'x')
    .sort((a, b) => luxon.DateTime.fromISO(a.x) - luxon.DateTime.fromISO(b.x));
    
  fs.writeFileSync('scrape/production-wind.json', JSON.stringify(unique, null, 2));

  // const year = 2020;
  // const fromYear = unique.filter(p => luxon.DateTime.fromISO(p.x).year === year);
  // fs.writeFileSync(`scrape/production-wind${year}.json`, JSON.stringify(fromYear, null, 2));
})
  