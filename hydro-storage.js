const axios = require('axios');
const luxon = require('luxon');
const fs = require('fs');

let markets = process.argv.slice(2);
markets = markets.length > 0 ? markets : ['de']

markets.forEach((market, marketIndex) => {
  axios.get(`https://www.energy-charts.info/charts/filling_level/data/${market}/year_storage.json`)
    .then(response => response.data)
    .then(chartArray => {
      const X = chartArray[0].xAxisValues.map(ms => luxon.DateTime.fromMillis(ms));
      
      let labels = chartArray.map(chart => chart.name[0].en);
      labels[labels.length-1] = market.toUpperCase();
      labels = labels
        .map(l => l + '-Storage hydro')
        // Only on country level...
        .slice(-1)

      const data = chartArray
        .map(chart => chart.data)
        // Only on country level...
        .slice(-1)

      const transform = X.map((x, xIndex) => labels.reduce((obj, label, labelIndex) => ({ ...obj, [label]: data[labelIndex][xIndex] }), { x }))

      fs.writeFileSync(`scrape/raw/energy-hydrostorage-${market}.json`, JSON.stringify(transform, null, 2));
    })
})
