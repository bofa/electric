import {
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  HTMLSelect,
} from "@blueprintjs/core";
import React from 'react';
import { Chart } from 'react-chartjs-2';
// import fullDataSet from './data.json';
import AreaMultiSelect from './AreaMultiSelect';
import './App.css';
import trade from './trading';
import { DateTime } from 'luxon';
import axios from 'axios';
import TransformChart from './TransformChart';
// import { fft, util as fftUtil } from 'fft-js';
import { colors, adjustHexOpacity } from './utils';
import SelectConfidence, { confidenceTransforms } from './SelectConfidence';

// const optionsDatasetsArray = {
// }

// Add link to
// https://www.nordpoolgroup.com/en/the-power-market/Day-ahead-market/#:~:text=The%20daily%20process,delivery%20hours%20the%20next%20day.

function objectMap(object, mapFn) {
  return Object.keys(object).reduce(function(result, key) {
    result[key] = mapFn(object[key])
    return result
  }, {})
}

function transformSeries(series) {
  return series.map((p) => ({ ...objectMap(p, v => v === null ? NaN : v), x: DateTime.fromISO(p.x) }))
}

const referenceDate = DateTime.fromISO('2000-01-01T00:00:00');
function transformSin(p, bias, amplitude, frequence, phase) {
  return { x: p.x, y: bias + amplitude * Math.sin(frequence * p.x.diff(referenceDate, 'years').values.years + phase) };
}

const dataSets = [
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
    name: 'Export/Import',
    unit: 'MW'
  },
]

function App () {
  const [selectedAreas, setSelectedAreas] = React.useState(['SE3', 'SE']);
  const [windowSize, setWindowSize] = React.useState(24*7);
  const [samplingSize, setSamplingSize] = React.useState(24);
  const [range, setRange] = React.useState('Full');
  const [selectDataSet, setSelectDataSet] = React.useState('priceDataSet');
  const [priceDataSet, setPriceDataSet] = React.useState([{}]);
  const [consumptionDataSet, setConsumptionDataSet] = React.useState([{}]);
  const [productionDataSet, setProductionDataSet] = React.useState([{}]);
  const [exportDataSet, setExportDataSet] = React.useState([{}]);
  const [confidence, setConfidence] = React.useState(confidenceTransforms[1].key);
  
  const confidenceTransform = confidenceTransforms.find(transform => transform.key === confidence).transform;

  React.useEffect(() => {
    axios.get('https://raw.githubusercontent.com/bofa/electric/master/scrape/price.json')
      .then(response => response.data)
      .then(transformSeries)
      .then(setPriceDataSet);

    const consumption$ = axios.get('https://raw.githubusercontent.com/bofa/electric/master/scrape/consumption.json')
      .then(response => response.data)
      .then(transformSeries)

    const consumptionSwedenGranular$ = axios.get('https://raw.githubusercontent.com/bofa/electric/master/scrape/consumption-sweden-granular.json')
      .then(response => response.data)
      .then(transformSeries)

    Promise.all([consumption$, consumptionSwedenGranular$])
      .then(([production, productionSweden]) => {

        // This only works as long as the two series start on the same date
        const merge = production.map((p, i) => ({
          ...p,
          ...productionSweden[i],
        }))

        setConsumptionDataSet(merge);
      })
    
    const production$ = axios.get('https://raw.githubusercontent.com/bofa/electric/master/scrape/production.json')
      .then(response => response.data)
      .then(transformSeries)

    const productionSwedenGranular$ = axios.get('https://raw.githubusercontent.com/bofa/electric/master/scrape/production-sweden-granular.json')
      .then(response => response.data)
      .then(transformSeries)

    Promise.all([production$, productionSwedenGranular$])
      .then(([production, productionSweden]) => {

        // This only works as long as the two series start on the same date
        const merge = production.map((p, i) => ({
          ...p,
          ...productionSweden[i],
        }))

        setProductionDataSet(merge);
      })

    Promise.all([production$, consumption$]).then(([production, consumption]) => {
      const areas = Object.keys(production[0]).filter(item => item !== 'x');
      const exports = production.map((p, i) => ({ x: p.x, ...areas.reduce((obj, area) => ({ ...obj, [area]: p[area] - consumption[i][area] }), {}) }))
      
      setExportDataSet(exports)
    });
  }, [])

  const fullDataSet = { priceDataSet, consumptionDataSet, productionDataSet, exportDataSet }[selectDataSet];
  const areas = Object.keys(fullDataSet[0]).filter(item => item !== 'x');

  const now = DateTime.now();
  let lowerDate = DateTime.fromISO('2000-01-01T00:00:00');
  if (range === 'Past Week') {
    lowerDate = now.minus({ weeks: 1 })
  } else if (range === 'Past Month') {
    lowerDate = now.minus({ months: 1 })
  } else if (range === 'Past Year') {
    lowerDate = now.minus({ years: 1 })
  }

  const rangeDataSet = fullDataSet
    .filter(p => p.x - lowerDate > 0);

  const processedSeries = selectedAreas.filter(area => areas.includes(area)).map(area => {
    const tradingData = rangeDataSet
      .map(p => ({
        x: p.x,
        y: p[area] === null ? NaN : p[area],
      }))
    // const trades = trade(tradingData.map(d => d.y), 0.20, 24)
    // const sum = trades.filter((t, i) => i % 3 === 0).reduce((sum, value) => sum + value);

    // FFT
    // if (tradingData.length > 0) {
    //   const fftInput = tradingData
    //     .slice(0, 2 ** 13)
    //     .map(p => p.y);
    //   console.log('fftInput', fftInput, tradingData.length);
    //   const phasors = fft(fftInput);
    //   console.log('phasors', phasors);
    //   const frequencies = fftUtil.fftFreq(phasors, 8000) // Sample rate and coef is just used for length, and frequency step
    //   const magnitudes = fftUtil.fftMag(phasors);

    //   console.log('frequencies', magnitudes, frequencies);
    // }

    // const buy = trades.filter((t, i) => i % 3 === 1)
    //   .map(t => tradingData[t])
    
    // const sell = trades.filter((t, i) => i % 3 === 2)
    //   .map(t => tradingData[t])

    // const windowSize = 24;
    const ranges = tradingData.slice(windowSize-1).map((p, i) => {
      return tradingData
        .slice(i, i + windowSize)
    })
    
    const movingAverage = ranges.map((sampledWindow, i) => {
      const sampledWindowFiltered = sampledWindow.filter(p => !isNaN(p.y))

      const N = sampledWindowFiltered.length;
      const m = sampledWindowFiltered.reduce((s, p) => s + p.y, 0) / N;

      return {
        x: sampledWindow.at(-1).x,
        y: m,
      }
    })
      
    const { min, max } = confidenceTransform(ranges.map(r => r.map(p => p.y)), movingAverage);

    return {
      label: area,
      tradingData: tradingData,
      movingAverage: movingAverage.filter((_, i, a) => i % samplingSize === 0 || i === a.length - 1),
      min: min.filter((_, i, a) => i % samplingSize === 0 || i === a.length - 1),
      max: max.filter((_, i, a) => i % samplingSize === 0 || i === a.length - 1),
      // binAverage: averagePerHour,
      // buy,
      // sell,
    }
  })

  const dataTimeSeries = {
    datasets: 
      processedSeries.map((area, i) => [
          {
            type: windowSize === 1 ? 'scatter' : 'line',
            label: area.label,
            data: area.movingAverage,
            fill: false,
            backgroundColor: colors[i],
            borderColor: colors[i],
            pointRadius: windowSize === 1 ? 1 : 0,
            borderWidth: 1,
          },
        ].concat(windowSize === 1
          ? []
          : [
            {
              label: 'remove' + area.label + ' min',
              data: area.min,
              fill: 3*i,
              backgroundColor: adjustHexOpacity(i, 0.2),
              pointRadius: 0,
              borderWidth: 0,
            },
            {
              label: 'remove' + area.label + ' max',
              data: area.max,
              fill: 3*i,
              backgroundColor: adjustHexOpacity(i, 0.2),
              pointRadius: 0,
              borderWidth: 0,
            }
          ]
        ),
          // {
          //   type: windowSize === 1 ? 'scatter' : 'line',
          //   label: area.label,
          //   data: range.movingAverage,
          //   fill: false,
          //   backgroundColor: colors[i],
          //   borderColor: colors[i],
          //   pointRadius: windowSize === 1 ? 1 : 0,
          //   borderWidth: 1,
          // },
          // {
          //   type: windowSize === 1 ? 'scatter' : 'line',
          //   label: area.label,
          //   data: arerangea.movingAverage,
          //   fill: false,
          //   backgroundColor: colors[i],
          //   borderColor: colors[i],
          //   pointRadius: windowSize === 1 ? 1 : 0,
          //   borderWidth: 1,
          // },
          // {
          //   type: 'line',
          //   label: 'sin',
          //   data: area.movingAverage
          //     .map((p, i) => transformSin(p, 1.75e4, 3e3, 2*Math.PI, 1))
          //     .filter((_, i, a) => i % samplingSize === 0 || i === a.length - 1)
          //     ,
          //   fill: false,
          //   backgroundColor: colors[i+1],
          //   borderColor: colors[i+1],
          //   pointRadius: windowSize === 1 ? 1 : 0,
          //   borderWidth: 1,
          // },
          // {
          //   type: 'line',
          //   label: 'sin2',
          //   data: area.movingAverage
          //     .map((p, i) => transformSin(p, 1.33e4, 3e3, 2*Math.PI, 1))
          //     .filter((_, i, a) => i % samplingSize === 0 || i === a.length - 1)
          //     ,
          //   fill: false,
          //   backgroundColor: colors[i+1],
          //   borderColor: colors[i+1],
          //   pointRadius: windowSize === 1 ? 1 : 0,
          //   borderWidth: 1,
          // },
          // {
          //   type: 'scatter',
          //   label: 'Buy',
          //   data: area.buy,
          //   fill: false,
          //   backgroundColor: 'green',
          //   radius: 7,
          //   // borderColor: 'rgba(25, 99, 132, 0.2)',
          // },
          // {
          //   type: 'scatter',
          //   label: 'Sell',
          //   data: area.sell,
          //   fill: false,
          //   backgroundColor: 'red',
          //   radius: 7,
          //   // borderColor: 'rgba(25, 99, 132, 0.2)',
          // },
    ).flat(2)
  };

  const unit = dataSets?.find(ds => ds.key === selectDataSet)?.unit;

  const optionsTime = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 250,
        position: 'right',
        title: {
          display: true,
          text: unit,
        }
      },
      x: {
        type: 'time',
        time: {
          // Luxon format string
          tooltipFormat: 'DD T',
          unit: 'day',
          displayFormats: {
            day: 'yy-MM-dd'
          },
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
    },
    animation: false,
    normalized: true,
    spanGaps: true,
    // parsing: false,
    plugins: {
      legend: {
        position: 'left',
        labels: {
          filter: item=> !item.text.includes('remove')
        }
      }
    }
  }

  return (
    <div className="App">
      <Navbar>
        <NavbarGroup>
          <NavbarHeading>
            Param
          </NavbarHeading>
          <HTMLSelect value={selectDataSet} onChange={e => setSelectDataSet(e.currentTarget.value)}>
            {dataSets.map(({ key, name }) => <option value={key}>{name}</option>)}
          </HTMLSelect>
          <NavbarDivider/>
          <NavbarHeading>
            Range
          </NavbarHeading>
          <NavbarDivider/>
          <HTMLSelect value={range} onChange={e => setRange(e.currentTarget.value)}>
            {['Full', 'Past Year', 'Past Month', 'Past Week'].map(v => <option value={v}>{v}</option>)}
          </HTMLSelect>
          <NavbarDivider/>
          <AreaMultiSelect
            areas={areas}
            selectedAreas={selectedAreas}
            setSelectedAreas={setSelectedAreas}
          />
        </NavbarGroup>
      </Navbar>
      <div style={{ height: 'calc(50vh - 60px)', padding: 10 }}>
        <div style={{ position: 'fixed', float: 'left' }}>
          <HTMLSelect value={windowSize} onChange={e => {
            const newWindowSize = Number(e.currentTarget.value);
            setWindowSize(newWindowSize)
            if (newWindowSize < samplingSize) {
              setSamplingSize(newWindowSize);
            }
          }}>
            <option value={1}>Hour</option>
            <option value={8}>8 Hours</option>
            <option value={24}>Day</option>
            <option value={24*7}>Week</option>
            <option value={24*30}>Month</option>
          </HTMLSelect>
          <HTMLSelect value={samplingSize} onChange={e => setSamplingSize(Number(e.currentTarget.value))}>
            {[1, 24, 24*7].filter(v => v <= windowSize).map(v => <option value={v}>{v}</option>)}
          </HTMLSelect>
          <SelectConfidence
            confidence={confidence}
            setConfidence={setConfidence}
          />
        </div>
        <Chart type="line" data={dataTimeSeries} options={optionsTime}/>
     </div>
      <div style={{ height: 'calc(50vh - 60px)', padding: 10 }}>
        <TransformChart
          processedSeries={processedSeries}
          unit={unit}
        />
      </div>
      {/* {Math.round(sum)}EUR, {Math.round(sum/tradingData.length)}EUR/h, {Math.round(24 * 365 * sum/tradingData.length)}EUR/y */}
    </div>
  );
}

export default App;
