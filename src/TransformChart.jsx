import { useState } from 'react';
import {
  HTMLSelect,
} from "@blueprintjs/core";
import { Chart } from 'react-chartjs-2';
import { weekDayNames, monthNames, yearsNames, adjustHexOpacity, } from './utils';
import SelectConfidence, { confidenceTransforms } from './SelectConfidence';

function timeBinTransform(groupKey, groups, binKey, bins, labels) {
  return (series, confidenceTransform) => {
    const ranges = groups.map(group => bins.map(bin => series.tradingData
      .filter(p => !isNaN(p.y) && p.x[binKey] === bin && (groupKey === null || p.x[groupKey] === group))
      .map(p => p.y)
    ))

    const output = ranges.map((range, label) => {
      const average = range.map(range => range.reduce((sum, y) => sum + y, 0) / range.length);
      const bin = average.map((m, i) => ({ x: bins[i], y: m }));
      const { min, max } = confidenceTransform(range, bin);

      return {
        label: series.label + labels[label], // + ' ' + weekDayNames[label], 
        bin,
        min,
        max,
      };
    }).filter(group => !group?.bin.every(p => isNaN(p.y)))

    return output;
  };
}

const seriesTransforms = [
  {
    key: 'hour',
    name: 'Hourly',
    unit: seriesYUnit => ['hour', seriesYUnit],
    transform: timeBinTransform(
      null, [0],
      'hour', Array(24).fill().map((_, hour) => hour),
      ['']
    )
  },
  {
    key: 'hourPerWeekday',
    name: 'Hourly per weekday',
    unit: seriesYUnit => ['hour', seriesYUnit],
    transform: timeBinTransform(
      'weekday', Array(7).fill().map((_, weekday) => weekday + 1),
      'hour', Array(24).fill().map((_, hour) => hour),
      weekDayNames.map(d => ' ' + d)
    )
  },
  {
    key: 'hourPerMonth',
    name: 'Hourly per month',
    unit: seriesYUnit => ['hour', seriesYUnit],
    transform: timeBinTransform(
      'month', Array(12).fill().map((_, weekday) => weekday + 1),
      'hour', Array(24).fill().map((_, hour) => hour),
      monthNames.map(d => ' ' + d)
    )
  },
  {
    key: 'hourPerYear',
    name: 'Hourly per year',
    unit: seriesYUnit => ['hour', seriesYUnit],
    transform: timeBinTransform(
      'year', yearsNames,
      'hour', Array(24).fill().map((_, hour) => hour),
      yearsNames
    )
  },
  {
    key: 'month',
    name: 'Monthly',
    unit: seriesYUnit => ['month', seriesYUnit],
    transform: timeBinTransform(
      null, [0],
      'month', Array(12).fill().map((_, month) => month+1),
      ['']
    )
  },
  {
    key: 'monthOfYear',
    name: 'Monthly per year',
    unit: seriesYUnit => ['month', seriesYUnit],
    transform: timeBinTransform(
      'year', yearsNames,
      'month', Array(12).fill().map((_, month) => month+1),
      yearsNames
    )
  },
  {
    key: 'histogram',
    name: 'Histogram',
    unit: seriesYUnit => [seriesYUnit, 'hours'],
    transform: series => {
      const numberOfBins = 100;

      const rawSeries = series.tradingData.map(p => p.y).filter(y => !isNaN(y))
      const min = Math.min(...rawSeries);
      const max = Math.max(...rawSeries);
      
      const step = (max - min) / numberOfBins;

      const histogram = Array(numberOfBins).fill().map((_, i) => min + i*step)
        .map(min => ({
          x: min,
          y: rawSeries.filter(y => y >= min && y < min + step).length
        }));

      return [{
        label: series.label,
        bin: histogram,
        min: [],
        max: [],
      }];
    }
  },
  {
    key: 'histogramPerYear',
    name: 'Histogram Per Year',
    unit: seriesYUnit => [seriesYUnit, 'hours'],
    transform: series => yearsNames.map(year => {
      const numberOfBins = 100;
      
      const rawSeries = series.tradingData
        .filter(p => p.x.year === year)
        .map(p => p.y)
        .filter(y => !isNaN(y))
      
      const min = Math.min(...rawSeries);
      const max = Math.max(...rawSeries);
      
      const step = (max - min) / numberOfBins;

      const histogram = Array(numberOfBins).fill().map((_, i) => min + i*step)
        .map(min => ({
          x: min,
          y: rawSeries.filter(y => y >= min && y < min + step).length
        }));

      return {
        label: series.label + year,
        bin: histogram,
        min: [],
        max: [],
      };
    }).filter(group => !isNaN(group?.bin[0].x))
  },
]

export default function TransformChart(props) {
  const [transform, setTransform] = useState(seriesTransforms[0].key);
  const [confidence, setConfidence] = useState(confidenceTransforms[2].key);
  const confidenceTransform = confidenceTransforms.find(transform => transform.key === confidence).transform;
  
  const transformInstance = seriesTransforms.find(t => t.key === transform);

  const binSeries = props.processedSeries
    .map(s => transformInstance.transform(s, confidenceTransform))
    .flat();

  console.log('binSeries', binSeries);

  const dataHourOfDay = {
    datasets: binSeries.map((area, i) => [
      {
        label: area.label,
        data: area.bin,
        borderColor: adjustHexOpacity(i, 1),
        // pointRadius: 0,
        // borderWidth: 1,
      },
      {
        label: 'remove' + area.label + ' min',
        data: area?.min,
        fill: 3*i,
        backgroundColor: adjustHexOpacity(i, 0.2),
        pointRadius: 0,
        borderWidth: 0,
      },
      {
        label: 'remove' + area.label + ' max',
        data: area?.max,
        fill: 3*i,
        backgroundColor: adjustHexOpacity(i, 0.2),
        pointRadius: 0,
        borderWidth: 0,
      }
    ]).flat()
  }

  const [xUnit, yUnit] = transformInstance.unit(props.unit);

  const optionsTransform = {
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        // min: 2019,
        // max: 2022,
        title: {
          display: true,
          text: xUnit,
        }
      },
      y: {
        beginAtZero: true,
        suggestedMax: 250,
        position: 'right',
        title: {
          display: true,
          text: yUnit,
        }
      },
    },
    animation: false,
    normalized: true,
    // spanGaps: true
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
    <>
      <div style={{ position: 'fixed' }}>
        <HTMLSelect value={transform} onChange={e => setTransform(e.currentTarget.value)}>
          {seriesTransforms.map(({ key, name }) => <option value={key}>{name}</option>)}
        </HTMLSelect>
        <SelectConfidence
          confidence={confidence}
          setConfidence={setConfidence}
        />
      </div>
      <Chart type="line" data={dataHourOfDay} options={optionsTransform}/>
    </>
  )
}