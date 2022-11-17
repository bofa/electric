const folderRead = './scrape/raw/';
const folderWrite = './scrape/processed-refactor/';
const fs = require('fs');
const luxon = require('luxon');

// Extract options
const allFiles = fs.readdirSync(folderRead).filter(file => file.includes('.json'))
// TODO
const combineKeys =
[]
// [
//   ['Hydro Pumped', ['Hydro pumped storage consumption', 'Hydro pumped storage']],
//   ['Wind Total', ['Wind offshore', 'Wind onshore']],
//   ['Coal Total', ['Fossil brown coal / lignite', 'Fossil hard coal', 'Fossil coal-derived gas']],
//   ['Hydro Total', ['Hydro pumped storage consumption', 'Hydro pumped storage', 'Hydro water reservoir', 'Hydro Run-of-River']],
// ]

const removeKeys = combineKeys
  .map(key => key[1])
  .flat();

allFiles
  // Debug
  // .filter(file => file.includes('se'))
  .forEach(file => {
      const marketLabel = file.split('-')[2].slice(0,2) + '-';
      const type = file.split('-')[1] + '-';
      const content = JSON.parse(fs.readFileSync(folderRead + file));
      
      const pKeys = Object.keys(content[0]);
      const combineKeysValid = combineKeys.filter(c => c[1].some(key => pKeys.some(pk => pk.includes(key))))

      console.log('combineKeysValid', pKeys, combineKeysValid);

      const contentTransform = content
        // Combine keys
        .map(y => ({ ...y, ...combineKeysValid.reduce((obj, combine) => ({
          ...obj,
          [combine[0]]: combine[1].filter(k => y[k]).length < 1
            ? null :
            combine[1].filter(k => y[k]).reduce((sum, k) => sum + y[k], 0)
        }), {}) }))
        .map(y => {
          removeKeys.forEach(k => delete y[k]);

          return y;
        })
        // Remove null keys
        .map(y => {
          removeKeys.forEach(k => delete y[k]);

          return y;
        })
        // Map on market label
        .map(y => Object.keys(y).filter(k => k !== 'x').reduce((obj, k) => ({ ...obj, [k]: y[k] }), { x: luxon.DateTime.fromISO(y.x) }))
        // Remove keys

      const startYear = contentTransform.at(0).x.year;
      Array(luxon.DateTime.now().year - startYear + 1).fill()
        .forEach((_, i) => {
          const year = startYear + i
          const startIndex = contentTransform.findIndex(p =>p.x.year === year);
          let endIndex = contentTransform.findIndex(p =>p.x.year === year + 1) - 1;
          endIndex = endIndex < 0 ? undefined : endIndex;

          const contentYear = contentTransform.slice(startIndex, endIndex);
          const newFilename = marketLabel + type + year + '.json';

          fs.writeFileSync(folderWrite + newFilename, JSON.stringify(contentYear));
        })
  })
