const folder = './scrape/raw/';
const fs = require('fs');

// Extract options
const allFiles = fs.readdirSync(folder).filter(file => file.includes('.json'))
const options = // ['price', 'production', 'consumption']
[
  {
    key: 'priceDataSet',
    name: 'Price',
    unit: 'EUR/MWh',
    fields: ['-price'],
  },
  {
    key: 'productionDataSet',
    name: 'Production',
    unit: 'MW',
    fields: [
      '-Nuclear',
      '-Hydro Run-of-River',
      '-Biomass',
      '-Fossil brown coal / lignite',
      '-Fossil hard coal',
      '-Fossil oil',
      '-Fossil gas',
      '-Geothermal',
      '-Hydro water reservoir',
      '-Hydro pumped storage',
      '-Wind offshore',
      '-Wind onshore',
      '-Solar',
    ],
  },
  {
    key: 'consumptionDataSet',
    name: 'Consumption',
    unit: 'MW',
    fields: ['-Load'],
  },
  {
    key: 'exportDataSet',
    name: 'Export',
    unit: 'MW',
    fields: ['-Import Balance'],
  },
].map(option => {
    const typeFiles = allFiles // .filter(file => file.includes(option.name.toLowerCase()))

    const files = typeFiles
      .map(file => ({
        file: file,
        options: Object.keys(JSON.parse(fs.readFileSync(folder + file))[0])
          .filter(key => key !== 'x')
          .filter(key => option.fields.some(partial => key.includes(partial)))
      }))
      // .sort((a, b) => a.localeCompare(b))

    return {
      ...option,
      files,
    };
  })

fs.writeFileSync('scrape/options.json', JSON.stringify(options, null, 2));
