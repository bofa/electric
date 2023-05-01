const predefinedList = [
  {
    key: 'sweden-short-price',
    text: 'Sweden Current Price',

    selectDataSet: 'priceDataSet',
    range: 'Past Month',
    selectedAreas: ['SE3-Price'],
    merge: false,

    windowSize: 1,
    samplingSize: 1,
    transform: 'hour',
    confidence: 'off',
    confidenceTransform: 'off',
  },
  {
    key: 'france-nuclear',
    text: 'France Nuclear',

    selectDataSet: 'productionDataSet',
    range: 'Full',
    selectedAreas: ['FR-Nuclear', 'FR-Import', 'FR-Load'],
    merge: false,

    windowSize: 24*7,
    samplingSize: 24,
    transform: 'year',
    confidence: 'std1',
    confidenceTransform: 'off',
  },
  {
    key: 'price',
    text: 'Wide Price',

    selectDataSet: 'priceDataSet',
    range: '2021->',
    selectedAreas: ['SE3-Price', 'FI-Price', 'DE-LU-Price', 'FR-Price'],
    merge: false,

    windowSize: 24*7,
    samplingSize: 24,
    transform: 'hour',
    confidence: 'off',
    confidenceTransform: 'off',
  },
  {
    key: 'gas',
    text: 'Gas Storage',

    confidence: "stacked",
    range: "Full",
    selectDataSet: "energyDataSet",
    selectedAreas: ['DE-Storage gas', 'IT-Storage gas', 'FR-Storage gas', 'NL-Storage gas', 'AT-Storage gas'],
    merge: true,

    windowSize: 24,
    samplingSize: 24,
    confidence: 'off',
    transform: 'weekOfYear',
    confidenceTransform: 'off',
  },
  {
    key: 'prodSweden',
    text: 'Production Sweden',

    "selectedAreas": [
      "SE-Hydro",
      "SE-Nuclear",
      "SE-Wind",
      "SE-Others"
    ],
    "range": "Past Month",
    "selectDataSet": "productionDataSet",
    "windowSize": 1,
    "samplingSize": 1,
    "confidence": "stacked",
    merge: false,
    transform: 'hour',
    confidenceTransform: 'stacked',
  },
  {
    key: 'prodItaly',
    text: 'Production Italy',

    selectedAreas: [
      "IT-Gas",
      "IT-Hydro",
      "IT-Coal",
      "IT-Solar",
      "IT-Wind",
      "IT-Others"
    ],
    range: "Past Month",
    selectDataSet: "productionDataSet",
    windowSize: 1,
    samplingSize: 1,
    confidence: "stacked",
    merge: false,
    transform: 'hour',
    confidenceTransform: 'stacked',
  },
  {
    key: 'prodPoland',
    text: 'Production Poland',

    "selectedAreas": [
      "PL-Coal",
      "PL-Wind",
      "PL-Solar",
      "PL-Gas",
      "PL-Hydro"
    ],
    "range": "Past Month",
    "selectDataSet": "productionDataSet",
    "windowSize": 1,
    "samplingSize": 1,
    "confidence": "stacked",
    transform: 'hour',
    confidenceTransform: 'stacked',
    merge: false,
  }
]

export default predefinedList;