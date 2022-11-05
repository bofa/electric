const axios = require('axios');
const luxon = require('luxon');
const fs = require('fs');

function uniq(a, key) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true);
  });
}

const weeks = [
  Array(52).fill().map((_, i) => ({ year: '2020', week: String(i+1).padStart(2, '0') })),
  Array(52).fill().map((_, i) => ({ year: '2021', week: String(i+1).padStart(2, '0') })),
  Array(40).fill().map((_, i) => ({ year: '2022', week: String(i+1).padStart(2, '0') })),
].flat()
  .map((weekObj, delay) => new Promise(resolve => setTimeout(resolve, 350 * delay)).then(() =>
    axios.get(`https://www.energy-charts.info/charts/power/data/de/week_${weekObj.year}_${weekObj.week}.json`)
      .then(response => response.data)
      .then(sources => {
        // const date = new luxon.DateTime(sources[0].xAxisValues[0])
        console.log('weekObj', weekObj);

        const individualSource = sources.map(source => source.data.map(y => ({ ['DE-' + source.name.en]: y })))
        const merge = individualSource[0].map((_, i) => ({
          x: luxon.DateTime.fromMillis(sources[0].xAxisValues[i]),
          ...individualSource.map(source => source[i]).reduce((merge, source) => ({ ...merge, ...source}), {})
        }))

        return merge;
      }))
  )

Promise.all(weeks)
  .then(weeks => {
    const flat = weeks.flat();

    const unique = uniq(flat, 'x')
      .sort((a, b) => a.x - b.x);

    fs.writeFileSync('scrape/production-germany.json', JSON.stringify(unique, null, 2));
  })