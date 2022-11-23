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

const days = 3 * 365;
data$ = Array(days).fill().map((_, i) => {
  const date = luxon.DateTime.now().minus({ days: i + 2 });
  const endTime = date.toFormat('yyyy-MM-dd');

  return new Promise(resolve => setTimeout(resolve, 350 * i))
    .then(() => axios.get(`https://agsi.gie.eu/api?date=${endTime}`))
    .then(response => response.data.data.map(m => m.children).flat())
    .then(markets => {
      // console.log('market', markets[0])
      const x = luxon.DateTime.fromISO(markets[0]?.gasDayStart);

      const output = markets
        // .filter(market => market.gasInStorage !== '-')
        .map(market => ({
          market: market.code,
          data: {
            x,
            [market.code.slice(0, 2) + '-Gas In Storage']: Number(market.gasInStorage),
            [market.code.slice(0, 2) + '-Gas Capacity']: Number(market.workingGasVolume),
          },
        }))
        // .reduce((obj, market) => ({ ...obj, ...market}), { x })

      return output;
    })
})

data$.forEach((r, i) => r.then(() => console.log(i, Math.round(100 * i / days))));

Promise.all(data$).then(data => {

  const markets = data[0]
    .map(p => p.market)

  markets.forEach((market, i) => {
    const marketSlice = market.slice(0, 2);
    const sorted = data.map(date => date.find(p => p.market === market)?.data)
      .sort((d1, d2) => d1.x - d2.x)
    
    fs.writeFileSync(`scrape/raw/gie-gas-${marketSlice}.json`, JSON.stringify(sorted, null, 2));
    // console.log('transformed', market, data);
  })
})
  