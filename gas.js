const axios = require('axios');
const fs = require('fs');
const luxon = require('luxon');
// const importData = require('./scrape/price.json');

function uniq(a, key) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}

const days = 10; // 1 * 365;
data$ = Array(days).fill().map((_, i) => {
  const endTime = luxon.DateTime.now().minus({ days: i - 2 }).toFormat('yyyy-MM-dd');

  return new Promise(resolve => setTimeout(resolve, 350 * i))
    .then(() => axios.get(`https://agsi.gie.eu/api?date=${endTime}`))
    .then(response => response.data.data.map(m => m.children).flat())
    .then(markets => {
      const output = markets;

      return output;
    })
})

data$.forEach((r, i) => r.then(() => console.log(i)));

Promise.all(data$).then(response => {
  const flat = response
    .flat()
    // .concat(importData)

  // const unique = uniq(flat, 'x')
  //   .sort((a, b) => luxon.DateTime.fromISO(a.x) - luxon.DateTime.fromISO(b.x));
    
  fs.writeFileSync('scrape/raw-gas/gas.json', JSON.stringify(flat, null, 2));
})
  