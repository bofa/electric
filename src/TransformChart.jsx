import { useState, useEffect } from 'react';
import { HTMLSelect } from "@blueprintjs/core";
import { Chart } from 'react-chartjs-2';
import { weekDayNames, monthNames, yearsNames, adjustHexOpacity, } from './utils/utils';
import SelectConfidence, { confidenceTransforms } from './SelectConfidence';
import { DateTime } from 'luxon';

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
    key: 'week',
    name: 'Weekly',
    unit: seriesYUnit => ['weekNumber', seriesYUnit],
    transform: timeBinTransform(
      null, [0],
      'weekNumber', Array(53).fill().map((_, i) => i+1),
      ['']
    )
  },
  {
    key: 'weekOfYear',
    name: 'Weekly per year',
    unit: seriesYUnit => ['weekNumber', seriesYUnit],
    transform: timeBinTransform(
      'weekYear', yearsNames,
      'weekNumber', Array(53).fill().map((_, i) => i+1),
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
    key: 'year',
    name: 'Yearly',
    unit: seriesYUnit => ['year', seriesYUnit],
    transform: timeBinTransform(
      null, [0],
      'year', Array(DateTime.now().year - 2015 + 1).fill().map((_, i) => 2015 + i),
      ['']
    )
  },
  {
    key: 'histogram',
    name: 'Histogram',
    unit: seriesYUnit => [seriesYUnit, '100 hours / MW'],
    transform(series) {
      const numberOfBins = 100;

      const rawSeries = series.tradingData.map(p => p.y).filter(y => !isNaN(y))
      const min = Math.min(...rawSeries);
      const max = Math.max(...rawSeries);
      
      const step = (max - min) / numberOfBins;

      const histogram = Array(numberOfBins).fill().map((_, i) => min + i*step)
        .map(min => ({
          x: Math.round(min + step/2),
          y: 100 * rawSeries.filter(y => y >= min && y < min + step).length / step,
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
          y: 100 * rawSeries.filter(y => y >= min && y < min + step).length / step
        }));

      return {
        label: series.label + year,
        bin: histogram,
        min: [],
        max: [],
      };
    }).filter(group => !isNaN(group?.bin[0].x))
  },
  {
    key: 'currentYearWithRange',
    name: 'Current Year and Range',
    unit: seriesYUnit => ['Date', seriesYUnit],
    transform: series => {
      const startDate = series.tradingData.at(-1).x;
      const filterDate = startDate.minus({ year: 1});

      const seriesCurrent = series.tradingData
        .filter(p => p.x - filterDate > 0)

      const seriesCompare = series.tradingData
        .filter(p => p.x - filterDate <= 0)

      const weeks = Array(53).fill().map((_, i) => i+1)
        .map(week => {
          const values = seriesCompare.filter(p => p.x.weekNumber === week).map(p => p.y)

          return {
            min: Math.min(...values),
            max: Math.max(...values),
            average: values.reduce((avg, value) => avg + value, 0) / values.length
          }
        })

      const average = seriesCurrent.map(p => ({ x: p.x, y: weeks[p.x.weekNumber-1].average }))
      const min = seriesCurrent.map(p => ({ x: p.x, y: weeks[p.x.weekNumber-1].min }));
      const max = seriesCurrent.map(p => ({ x: p.x, y: weeks[p.x.weekNumber-1].max }));

      console.log('weeks', weeks, average);

      return [
        {
          label: series.label,
          bin: seriesCurrent,
          min: [],
          max: [],
        },
        {
          label: series.label + ' Average',
          bin: average,
          min,
          max,
        }
      ];
    }
  },
]

export default function TransformChart(props) {
  const [transform, setTransform] = useState(seriesTransforms[0].key);
  const [confidence, setConfidence] = useState(confidenceTransforms[2].key);
  const confidenceTransform = confidenceTransforms.find(transform => transform.key === confidence).transform;
  const { pre } = props;

  useEffect(() => {
    if (pre) {
      setTransform(pre.transform);
      setConfidence(pre.confidenceTransform);
    }
  }, [pre]);

  const transformInstance = seriesTransforms.find(t => t.key === transform);

  const binSeries = props.processedSeries
    .map(s => transformInstance.transform(s, confidenceTransform))
    .flat();

  const stacked = confidence === 'stacked';

  const dataHourOfDay = {
    datasets: binSeries.map((area, i) => [
      {
        label: area.label,
        data: area.bin,
        borderColor: adjustHexOpacity(i, 1),
        backgroundColor: adjustHexOpacity(i, 0.25),
        // pointRadius: 0,
        // borderWidth: 1,
        fill: !stacked ? false
          : i === 0 ? 'origin'
          : i-1,
      }
    ].concat(stacked ? [] : [
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
    ])).flat()
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
        stacked,
        beginAtZero: true,
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
        // position: 'left',
        labels: {
          filter: item=> !item.text.includes('remove')
        }
      }
    }
  }

  return (
    <>
      <div style={{ float: 'left' }}>
        <HTMLSelect value={transform} onChange={e => setTransform(e.currentTarget.value)}>
          {seriesTransforms.map(({ key, name }) => <option key={key} value={key}>{name}</option>)}
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