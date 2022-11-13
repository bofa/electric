const folderRead = './scrape/raw/';
const folderWrite = './scrape/processed/';
const fs = require('fs');

// Extract options
const allFiles = fs.readdirSync(folderRead).filter(file => file.includes('.json'))
const combineKeys = [
  ['Hydro Pumped', ['Hydro pumped storage consumption', 'Hydro pumped storage']],
  ['Wind Total', ['Wind offshore', 'Wind onshore']],
  ['Coal Total', ['Fossil brown coal / lignite', 'Fossil hard coal', 'Fossil coal-derived gas']],
  ['Hydro Total', ['Hydro pumped storage consumption', 'Hydro pumped storage', 'Hydro water reservoir', 'Hydro Run-of-River']],
]

const removeKeys = combineKeys
  .map(key => key[1])
  .flat();

allFiles
  // Debug
  // .filter(file => file.includes('de'))
  .forEach(file => {
    if (file.includes('energy-charts')) {
      const marketLabel = file.split('-')[2].slice(0,2).toUpperCase() + '-';
      const content = JSON.parse(fs.readFileSync(folderRead + file));
      
      const contentTransform = content
        // Combine keys
        .map(y => ({ ...y, ...combineKeys.reduce((obj, combine) => ({
          ...obj,
          [combine[0]]: combine[1].filter(k => y[k]).length < 1
            ? null :
            combine[1].filter(k => y[k]).reduce((sum, k) => sum + y[k], 0)
        }), {}) }))
        .map(y => {
          removeKeys.forEach(k => delete y[k]);

          return y;
        })
        // Map on market label
        .map(y => Object.keys(y).filter(k => k !== 'x').reduce((obj, k) => ({ ...obj, [marketLabel + k]: y[k] }), { x: y.x }))
        // Remove keys

      fs.writeFileSync(folderWrite + file, JSON.stringify(contentTransform, null, 2));
    } else {
      const content = JSON.parse(fs.readFileSync(folderRead + file));
      fs.writeFileSync(folderWrite + file, JSON.stringify(content));
    }
  })
