const folder = './scrape/';
const fs = require('fs');

// Calculate exports
const production = JSON.parse(fs.readFileSync('./scrape/production.json'))
const consumption = JSON.parse(fs.readFileSync('./scrape/consumption.json'))

const exportKeys = Object.keys(production[0]).filter(v => v !== 'x')
const exportsCalc = production.map((p, i) => exportKeys.reduce((obj, key) => ({ ...obj, [key]: production[i][key] - consumption[i][key] }), { x: p.x }))

fs.writeFileSync('./scrape/export.json', JSON.stringify(exportsCalc, null, 2));

// Extract options
const allFiles = fs.readdirSync(folder).filter(file => file.includes('.json'))
const options = // ['price', 'production', 'consumption']
[
  {
    key: 'priceDataSet',
    name: 'Price',
    unit: 'EUR/MWh'
  },
  {
    key: 'consumptionDataSet',
    name: 'Consumption',
    unit: 'MW'
  },
  {
    key: 'productionDataSet',
    name: 'Production',
    unit: 'MW'
  },
  {
    key: 'exportDataSet',
    name: 'Export',
    unit: 'MW'
  },
].map(option => {
    const typeFiles = allFiles.filter(file => file.includes(option.name.toLowerCase()))

    const files = typeFiles
      .map(file => ({
        file,
        options: Object.keys(JSON.parse(fs.readFileSync(folder + file))[0]).filter(option => option !== 'x')
      }))
      // .sort((a, b) => a.localeCompare(b))

    return {
      ...option,
      files,
    };
  })

fs.writeFileSync('scrape/options.json', JSON.stringify(options, null, 2));
