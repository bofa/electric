const folder = './scrape/';
const fs = require('fs');

const allFiles = fs.readdirSync(folder).filter(file => file.includes('.json'))

// files.forEach(file => console.log(file))

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
  // {
  //   key: 'exportDataSet',
  //   name: 'Export/Import',
  //   unit: 'MW'
  // },
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
  
console.log('types', options);

fs.writeFileSync('scrape/options.json', JSON.stringify(options, null, 2));