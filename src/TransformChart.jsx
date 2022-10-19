import { useState } from 'react';
import {
  HTMLSelect,
} from "@blueprintjs/core";
import { Chart } from 'react-chartjs-2';
import { colors, weekDayNames, adjustHexOpacity } from './utils';

const optionsTransform = {
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'linear',
      // min: 2019,
      // max: 2022,
    },
    y: {
      beginAtZero: true,
      suggestedMax: 250,
      position: 'right'
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

export default function TransformChart(props) {
  const [transform, setTransform] = useState('timeOfDay')

  const binSeries = props.processedSeries.map(s => {

    if (transform === 'timeOfDay') {
      const pricePerHour = Array(24).fill()
        .map((_, h) => s.tradingData.filter(p => p.x.hour === h && !isNaN(p.y)).map(p => p.y))
      
      const averagePerHour = pricePerHour.map((range, i) => ({
        x: i,
        y: range.reduce((sum, y) => sum + y, 0) / range.length
      }));

      const std = pricePerHour.map((range, i) => Math.sqrt(range.reduce((sum, y) => sum + (y - averagePerHour[i].y)**2, 0) / range.length))
      const min  = std.map((std, i) => ({ x: i, y: averagePerHour[i].y - std }));
      const max = std.map((std, i) => ({ x: i, y: averagePerHour[i].y + std }));

      return [{
        label: s.label,
        bin: averagePerHour,
        min,
        max, 
      }];
    } else if (transform === 'timeOfWeekday') {
      const pricePerWeekday = Array(7).fill()
        .map((_, weekday) => Array(24).fill().map((_, hour) => s.tradingData
          .filter(p => p.x.weekday === weekday + 1 && p.x.hour === hour && !isNaN(p.y))
          .map(p => p.y)
        ))
      const averagePerDay = pricePerWeekday.map((weekday, label) => {
        const average = weekday.map(range => range.reduce((sum, y) => sum + y, 0) / range.length);
        const std = weekday.map((range, i) => Math.sqrt(range.reduce((sum, y) => sum + (average[i] - y)**2, 0) / range.length));
        
        const bin = average.map((m, i) => ({ x: i, y: m }));
        // const min = average.map((m, i) => ({ x: i, y: m - std[i] }));
        // const max = average.map((m, i) => ({ x: i, y: m + std[i] }));

        return {
          label: s.label + ' ' + weekDayNames[label], 
          bin,
          min: [],
          max: [],
        };
      });

      return averagePerDay;
    } else if (transform === 'month') {
      const pricePerMonth = Array(12).fill().map((_, i) => i + 1)
        .map((m) => ({
          x: m,
          w: s.tradingData.filter(p => p.x.month === m && !isNaN(p.y)).map(p => p.y),
        }))
      const averagePerMonth = pricePerMonth
        .map(range => ({
          x: range.x,
          y: range.w.reduce((sum, y) => sum + y, 0) / range.w.length
        }));

      const std = pricePerMonth.map((range, i) => Math.sqrt(range.w.reduce((sum, y) => sum + (y - averagePerMonth[i].y)**2, 0) / range.w.length))
      const min  = averagePerMonth.map((p, i) => ({ x: i + 1, y: p.y - std[i] }));
      const max = averagePerMonth.map((p, i) => ({ x: i + 1, y: p.y + std[i] }));

      return [{
        label: s.label, 
        bin: averagePerMonth,
        min,
        max,
      }];
    } else if (transform === 'monthOfYear') {
      const startYear = s.tradingData.at(0).x.year;
      const endYear = s.tradingData.at(-1).x.year;
      console.log('startYear', startYear, endYear)
      return Array(endYear-startYear + 1).fill().map((_, i) => startYear + i).map((year) => {
        const pricePerMonth = Array(12).fill().map((_, i) => i + 1)
          .map((month) => ({
            x: month,
            w: s.tradingData.filter(p => p.x.year === year && p.x.month === month && !isNaN(p.y)).map(p => p.y),
          }))
        const averagePerMonth = pricePerMonth
          .map(range => ({
            x: range.x,
            y: range.w.reduce((sum, y) => sum + y, 0) / range.w.length
          }));

        const std = pricePerMonth.map((range, i) => Math.sqrt(range.w.reduce((sum, y) => sum + (y - averagePerMonth[i].y)**2, 0) / range.w.length))
        const min  = averagePerMonth.map((p, i) => ({ x: i + 1, y: p.y - std[i] }));
        const max = averagePerMonth.map((p, i) => ({ x: i + 1, y: p.y + std[i] }));

        return {
          label: s.label + year, 
          bin: averagePerMonth,
          // min,
          // max,
        };
      })
    } else if (transform === 'hourOfYear') {
      const startYear = s.tradingData.at(0).x.year;
      const endYear = s.tradingData.at(-1).x.year;
      return Array(endYear-startYear + 1).fill().map((_, i) => startYear + i).map((year) => {
        const pricePerMonth = Array(24).fill().map((_, i) => i)
          .map((hour) => ({
            x: hour,
            w: s.tradingData.filter(p => p.x.year === year
              && p.x.hour === hour
              && !isNaN(p.y)
              // && p.x.month === 10
              // && [1,2,3,4,5].includes(p.x.weekday)
              // && p.x.day <= 18
          ).map(p => p.y),
          }))
        const averagePerMonth = pricePerMonth
          .map(range => ({
            x: range.x,
            y: range.w.reduce((sum, y) => sum + y, 0) / range.w.length
          }));

        const std = pricePerMonth.map((range, i) => Math.sqrt(range.w.reduce((sum, y) => sum + (y - averagePerMonth[i].y)**2, 0) / range.w.length))
        const min  = averagePerMonth.map((p, i) => ({ x: i + 1, y: p.y - std[i] }));
        const max = averagePerMonth.map((p, i) => ({ x: i + 1, y: p.y + std[i] }));

        return {
          label: s.label + year, 
          bin: averagePerMonth,
          // min,
          // max,
        };
      })
    } else if (transform === 'histogram') {
      const numberOfBins = 100;

      const rawSeries = s.tradingData.map(p => p.y).filter(y => !isNaN(y))
      const min = Math.min(...rawSeries);
      const max = Math.max(...rawSeries);
      
      const step = (max - min) / numberOfBins;

      const histogram = Array(numberOfBins).fill().map((_, i) => min + i*step)
        .map(min => ({
          x: min,
          y: rawSeries.filter(y => y >= min && y < min + step).length
        }));

      return [{
        label: s.label,
        bin: histogram,
        min: [],
        max: [],
      }];
    }
  }).flat();

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

  return (
    <>
      <div style={{ position: 'fixed' }}>
        <HTMLSelect value={transform} onChange={e => setTransform(e.currentTarget.value)}>
          <option value={'timeOfDay'}>Time of day</option>
          <option value={'timeOfWeekday'}>Time of weekday</option>
          <option value={'month'}>Month</option>
          <option value={'monthOfYear'}>Month of year</option>
          <option value={'hourOfYear'}>Hour of year</option>
          <option value={'histogram'}>Histogram</option>
        </HTMLSelect>
      </div>
      <Chart type="line" data={dataHourOfDay} options={optionsTransform}/>
    </>
  )
}