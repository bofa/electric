import { HTMLSelect } from "@blueprintjs/core";
import React from 'react';
import { Chart } from 'react-chartjs-2';
import './App.css';
import trade from './trading';
import { DateTime } from 'luxon';
import axios from 'axios';
import TransformChart from './TransformChart';
// import { fft, util as fftUtil } from 'fft-js';
import { adjustHexOpacity } from './utils';
import SelectConfidence, { confidenceTransforms } from './SelectConfidence';
import ProcessSeries from './ProcessSeries';

const referenceDate = DateTime.fromISO('2000-01-01T00:00:00');

const now = DateTime.now();
export const rangeOptions = [
  { key: 'Full',         from: DateTime.fromISO('2000-01-01') },
  ...Array(DateTime.now().year - 2015).fill().map((_, i) => 2016 + i)
  .map(year => ({ key: '' + year, from: DateTime.fromISO(year + '-01-01')})),
  { key: 'Past 2 Years', from: now.minus({ years:  2 }) },
  { key: 'Past Year',    from: now.minus({ years:  1 }) },
  { key: 'Past 2 Month', from: now.minus({ months: 2 }) },
  { key: 'Past Month',   from: now.minus({ months: 1 }) },
  { key: 'Past 2 Weeks', from: now.minus({ weeks:  2 }) },
  { key: 'Past Week',    from: now.minus({ weeks:  1 }) },
]

function App (props) {
  const [loadedFiles, setLoadedFiles] = React.useState([]);
  const [scatter, setScatter] = React.useState(false);
  const [windowSize, setWindowSize] = React.useState(24*7);
  const [samplingSize, setSamplingSize] = React.useState(24);
  const [priceDataSet, setPriceDataSet] = React.useState([]);
  const [productionDataSet, setProductionDataSet] = React.useState([]);
  const [energyDataSet, setEnergyDataSet] = React.useState([]);
  // const [datasets, setDatasets] = React.useState([]);
  const [confidence, setConfidence] = React.useState(confidenceTransforms[1].key);

  const { selectedAreas, selectDataSet, range, pre, merge, options } = props;

  console.log('Possible Preset', JSON.stringify({
    selectedAreas,
    range,
    selectDataSet,
    selectedAreas,
    windowSize,
    samplingSize,
    confidence,
    // transform,
    // confidenceTransform
  }, null, 2));

  const confidenceTransform = confidenceTransforms.find(transform => transform.key === confidence).transform;

  let lowerDate = rangeOptions.find(ro => ro.key === range)?.from;

  React.useEffect(() => {
    const files = selectedAreas
      .map(area => options
        .find(option => option.key === selectDataSet)?.files
        .filter(file => file.options.map(o => o.key).includes(area))
        .map(file => file.file)
      )
      .flat()
      .filter(file => file !== undefined)
      .filter((file, i, a) => a.indexOf(file) === i)
      .filter(file => !loadedFiles.includes(file))
      // Check year
      .filter(file => Number(file.split('.')[0].split('-')[2]) >= lowerDate.year)

    setLoadedFiles(loadedFiles => loadedFiles.concat(files))

    Promise.all(files.map(file => axios
      .get(`https://raw.githubusercontent.com/bofa/electric/master/scrape/processed-refactor/` + file)
      .then(response => response.data)
        .catch(error => {
          console.warn('Error', error);
          return [{ x: '2019-01-01' }];
        })
        .then(transformSeries)
      ))
      .then(seriesArray => {
        options.forEach(option => {
          // const setFunc = setDatasets;
          const setFunc = option.key === 'priceDataSet'       ? setPriceDataSet
                        : option.key === 'productionDataSet'  ? setProductionDataSet
                        : option.key === 'energyDataSet'      ? setEnergyDataSet
                        : () => {};
            
          setFunc(state => {
            const seriesFilteredObj = seriesArray
              .flat()
              .filter(s => option.fields.some(f => s.label.includes(f)))
              .map(s => ({ ...s, data: s.data.filter(p => p.x.year >= 2000) }))
              .concat(state)
              .reduce((obj, s) => ({ ...obj, [s.label]: obj[s.label]?.concat(s.data) || s.data }), {})
            
            const seriesFiltered = Object.keys(seriesFilteredObj)
              .map(key => ({ label: key, data: seriesFilteredObj[key].sort((a, b) => a.x - b.x) }))

            return seriesFiltered;
          });
        })
      })
    
  }, [selectDataSet, selectedAreas.length, options, range, pre])

  React.useEffect(() => {
    if (pre) {
      setConfidence(pre.confidence);
      setWindowSize(pre.windowSize);
      setSamplingSize(pre.samplingSize);
    }
  }, [pre]);

  let fullDataSet = { priceDataSet, productionDataSet, energyDataSet }[selectDataSet]; // TODO datasets
  const loading = fullDataSet === null || fullDataSet.length < 1;
  fullDataSet = loading ? [] : fullDataSet;

  const flatOptions = options
    .map(o => o.files)
    .flat()
    .map(f => f.options)
    .flat();

  let processedSeriesBeforeMerge = fullDataSet
    .filter(series => selectedAreas.includes(series.label))
    .map(series => ({ option: flatOptions?.findLast(o => o.key === series.label), ...series }))
    .sort((s1, s2) => {
      if (s1.option.negative ^ s2.option.negative) {
        return s2.option.negative - s1.option.negative;
      }

      return s1.option.stdMovingAverage - s2.option.stdMovingAverage;
    })

  if (merge && processedSeriesBeforeMerge.length > 0) {
    const labels = processedSeriesBeforeMerge.map(series => series.label);
    const dataMerge = processedSeriesBeforeMerge
      .map(series => series.data)
      .sort((a, b) => b.length - a.length)
      .reduce((out, data) => out.map((p, i) => ({
        x: p.x,
        y: p.y + customFind(p.x, i, data)
      })));

    processedSeriesBeforeMerge = [{
      label: 'Merge ' + labels.join(', '),
      data: dataMerge,
    }]
  }

  const processedSeries = processedSeriesBeforeMerge
    .map(series => ProcessSeries(series, range, windowSize, samplingSize, confidence, confidenceTransform, lowerDate))

  const stacked = confidence === 'stacked';

  const dataTimeSeries = {
    datasets: 
      processedSeries.map((area, i) => [
        {
          type: scatter ? 'scatter' : 'line',
          label: area.label,
          data: area.movingAverage
            .map(p => stacked ? ({ x: p.x, y: Math.max(p.y, 0) }) : p),
          backgroundColor: adjustHexOpacity(i, 0.25),
          borderColor: adjustHexOpacity(i, 1),
          pointRadius: scatter ? 1 : 0,
          borderWidth: 1,
          // TODO
          fill: !stacked ? false
            : i === 0 ? 'origin'
            : i-1,
        },
      ]
      .concat(windowSize === 1
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
        ].filter(s => s.data.length > 0)
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
    // Append negative series
    .concat(stacked
      ? processedSeries
        .map((area, index) => ({ area, index }))
        .filter(({ area }) => area.movingAverage.some(p => p.y < 0))
        .map(({ area, index }) => ({
          label: area.label + ' Negative',
          data: area.movingAverage.map(p => ({ x: p.x, y: p.y <= 0 ? p.y : NaN })),
          fill: 'origin',
          backgroundColor: adjustHexOpacity(index, 0.25),
          borderColor: adjustHexOpacity(index, 1),
          pointRadius: 0,
          borderWidth: 1,
          stacked: false,
        }))
      : [])
  };

  const unit = options?.find(ds => ds.key === selectDataSet)?.unit;

  const optionsTime = {
    maintainAspectRatio: false,
    scales: {
      y: {
        stacked,
        beginAtZero: true,
        // suggestedMax: 250,
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
    spanGaps: false,
    // parsing: false,
    plugins: {
      legend: {
        // position: 'left',
        labels: {
          filter: item=> !item.text.includes('remove')
        }
      }
    }
  }

  return (
    <>
      <div style={{ height: 'calc(50vh - 66px)', padding: 14 }}>
        <div style={{ float: 'left' }}>
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
            {[1, 24, 24*7].filter(v => v <= windowSize).map(v => <option key={v} value={v}>{v}</option>)}
          </HTMLSelect>
          <SelectConfidence
            confidence={confidence}
            setConfidence={setConfidence}
          />
        </div>
        <Chart type="line" data={dataTimeSeries} options={optionsTime}/>
     </div>
      <div style={{ height: 'calc(50vh - 66px)', padding: 10 }}>
        <TransformChart
          processedSeries={processedSeries}
          unit={unit}
          pre={pre}
        />
      </div>
      {/* {Math.round(sum)}EUR, {Math.round(sum/tradingData.length)}EUR/h, {Math.round(24 * 365 * sum/tradingData.length)}EUR/y */}
    </>
  );
}

export default App;

function transformSeries(series) {
  series.forEach(p => p.x = DateTime.fromISO(p.x))
  const keys = Object.keys(series[0]).filter(key => key !== 'x')

  const formattedSeries = keys.map(key => ({
    label: key,
    data: series.map(p => ({ x: p.x, y: p[key] === null ? NaN : p[key] }))
  }))

  return formattedSeries;
}

function customFind(x, i, data) {
  if (i >= data.length) {
    i = data.length - 1;
  }

  if (+data[i].x === +x) {
    return data[i].y;
  }
    
  const direction = Math.sign(data[i].x - x);
  let halt;
  i += direction;
  while(i >= 0 && i < data.length) {
    halt = Math.sign(+data[i].x === +x)
    if (halt === 0) {
      return data[i].y;
    } else if (direction - halt === 0) {
      return NaN;
    }
    i += direction;
  }
  
  return NaN;
}

function transformSin(p, bias, amplitude, frequence, phase) {
  return { x: p.x, y: bias + amplitude * Math.sin(frequence * p.x.diff(referenceDate, 'years').values.years + phase) };
}