const folderRead = './scrape/processed-refactor/';
const fs = require('fs');
const { DateTime } = require('luxon');

// Extract options
const allFiles = fs.readdirSync(folderRead)
  .filter(file => file.includes('.json'))
  // .filter(file => file.includes('it'))
  // .filter(file => file.includes('2023'))
  // .filter(file => file.includes('charts'))

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
    name: 'Power',
    unit: 'MW',
    fields: [
      '-Nuclear',
      // '-Hydro Run-of-River',
      '-Hydro',
      '-Biomass',
      // '-Fossil brown coal / lignite',
      // '-Fossil coal-derived gas',
      // '-Fossil hard coal',
      '-Coal',
      // '-Fossil oil',
      // '-Fossil gas',
      '-Oil',
      '-Gas',
      '-Geothermal',
      // '-Hydro water reservoir',
      // '-Hydro pumped storage',
      '-Hydro Pumped',
      // '-Wind offshore',
      // '-Wind onshore',
      '-Wind',
      '-Solar',
      '-Others',
      // '-Import Balance',
      '-Import',
      '-Load',
    ],
  },
  {
    key: 'energyDataSet',
    name: 'Energy',
    unit: 'TWh',
    fields: ['-Storage gas', '-Storage hydro'],
  },
].map(option => {
    const typeFiles = allFiles
      // .filter(file => file.includes('cz'))
      // .filter(file => file.includes('price'))
      // .filter(file => file.includes(2020))
      // .filter(file => file.includes(option.name.toLowerCase()))

    const files = typeFiles
      .map(file => {
        const content = JSON.parse(fs.readFileSync(folderRead + file));
        console.log('file', file);

        return {
          file: file,
          options: Object.keys(content[0])
            .filter(key => key !== 'x')
            .filter(key => option.fields.some(partial => key.includes(partial)))
            .map(key => {
              const values = content.map(p => p[key]).filter(v => v !== undefined);
              const average = values.reduce((sum, value) => sum + value, 0) / values.length;
              const window = 7 * 24;
              const movingAverage = values.map((_, i, a1) => a1.slice(Math.max(i-window, 0), i+1).reduce((s, v, i, a2) => s + v/a2.length, 0))
              const variance = values.reduce((sum , value, i) => sum + (value-movingAverage[i])**2, 0) / values.length;
              const negative = values.some(v => v < 0);

              const sampling = DateTime.fromISO(content[1]?.x).diff(DateTime.fromISO(content[0].x), 'hours').hours;  

              return {
                key,
                sampling,
                average: Math.round(average),
                stdMovingAverage: Math.round(Math.sqrt(variance)),
                negative,
              };
            })
            .filter(option => !isNaN(option.stdMovingAverage) && option.stdMovingAverage !== 0)
        }
      })
      .filter(file => file.options.length > 0)
      // .sort((a, b) => a.localeCompare(b))

    return {
      ...option,
      files,
    };
  })

fs.writeFileSync('scrape/options-refactor.json', JSON.stringify(options, null, 2));
