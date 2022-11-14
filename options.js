const folderRead = './scrape/processed/';
const fs = require('fs');

// Extract options
const allFiles = fs.readdirSync(folderRead).filter(file => file.includes('.json'))
const options = // ['price', 'production', 'consumption']
[
  {
    key: 'priceDataSet',
    name: 'Price',
    unit: 'EUR/MWh',
    fields: ['-price', '-Price'],
  },
  {
    key: 'productionDataSet',
    name: 'Production',
    unit: 'MW',
    fields: [
      '-Nuclear',
      // '-Hydro Run-of-River',
      '-Hydro Total',
      '-Biomass',
      // '-Fossil brown coal / lignite',
      // '-Fossil coal-derived gas',
      // '-Fossil hard coal',
      '-Coal Total',
      '-Fossil oil',
      '-Fossil gas',
      '-Geothermal',
      // '-Hydro water reservoir',
      // '-Hydro pumped storage',
      '-Hydro Pumped',
      // '-Wind offshore',
      // '-Wind onshore',
      '-Wind Total',
      '-Solar',
      '-Others',
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
      .map(file => {
        const content = JSON.parse(fs.readFileSync(folderRead + file));

        return {
          file: file,
          options: Object.keys(content[0])
            .filter(key => key !== 'x')
            .filter(key => option.fields.some(partial => key.includes(partial)))
            .map(key => {
              const values = content.slice(-365*24).map(p => p[key]);
              const average = values.reduce((sum, value) => sum + value) / content.length;
              const window = 7 * 24;
              const movingAverage = values.map((_, i, a1) => a1.slice(Math.max(i-window, 0), i+1).reduce((s, v, i, a2) => s + v/a2.length, 0))
              const variance = values.reduce((sum , value, i) => sum + (value-movingAverage[i])**2, 0) / content.length;
              return {
                key,
                average: Math.round(average),
                stdMovingAverage: Math.sqrt(variance),
              };
            })
            .filter(option => !isNaN(option.stdMovingAverage) && option.stdMovingAverage !== 0)
        }
      })
      // .sort((a, b) => a.localeCompare(b))

    return {
      ...option,
      files,
    };
  })

fs.writeFileSync('scrape/options.json', JSON.stringify(options, null, 2));
