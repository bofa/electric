const axios = require('axios');
const fs = require('fs');
const luxon = require('luxon');
const agsiApiKey = require('./agsiApiKey')
// const importData = require('./scrape/price.json');

function uniq(a, key) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}

const days = 10; // 8 * 365;
const data$ = Array(days).fill().map((_, i) => {
  const date = luxon.DateTime.now().minus({ days: i - 2 });
  const endTime = date.toFormat('yyyy-MM-dd');

  return new Promise(resolve => setTimeout(resolve, 350 * i))
    .then(() => axios.get(
      `https://agsi.gie.eu/api?date=${endTime}`,
      { headers: { 'x-key': agsiApiKey }}
    ))
    .then(response => {
      console.log(endTime);
      return response.data.data.map(m => m.children).flat()
    })
    .then(markets => {
      // console.log('market', markets[0])
      const x = luxon.DateTime.fromISO(markets[0]?.gasDayStart);

      const output = markets
        // .filter(market => market.gasInStorage !== '-')
        .map(market => ({
          market: market.code,
          data: {
            x,
            [market.code.slice(0, 2) + '-Storage gas']: Number(market.gasInStorage),
            [market.code.slice(0, 2) + '-Capacity gas']: Number(market.workingGasVolume),
          },
        }))
        // .reduce((obj, market) => ({ ...obj, ...market}), { x })

      return output;
    })
    .catch(error => {
      if (error.response) {
        console.warn('Error', error.response?.status, error.request?.path);
        return [];
      }

      console.error(error);
      throw error;
    })
})

data$.forEach((r, i) => r.then(() => console.log(i, Math.round(100 * i / days))));

Promise.all(data$).then(data => {

  const exclude = ['GB', 'IE'];
  const markets = data[0]
    .filter(p => !exclude.includes(p.market))
    .map(p => p.market);

  markets.forEach((market) => {
    const marketSlice = market.slice(0, 2);
    const fileName = `./scrape/raw/gie-gas-${marketSlice}.json`;

    let importData = [];
    try {
      importData = require(fileName).filter(p => p !== null);
    } catch {}
    importData.forEach(p => p.x = luxon.DateTime.fromISO(p.x))
    
    const concat = data.map(date => date.find(p => p.market === market)?.data)
      .concat(importData)
      .filter(p => !Object.keys(p).filter(k => k !== 'x').every(k => p[k] === null))
    
    const unique = uniq(concat, 'x')
      .sort((a, b) => a.x - b.x);

    fs.writeFileSync(fileName, JSON.stringify(unique, null, 2));
    // console.log('transformed', market, data);
  })
})
  