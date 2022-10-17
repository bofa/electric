import { useState } from 'react';
import {
  HTMLSelect,
} from "@blueprintjs/core";
import { Chart } from 'react-chartjs-2';
import { colors, weekDayNames } from './utils';

const optionsTransform = {
  maintainAspectRatio: false,
  scales: {
    x: {
      // type: 'linear'
    },
    y: {
      beginAtZero: true,
      suggestedMax: 250
    },
  },
  animation: false,
  normalized: true,
  // spanGaps: true
  // parsing: false,
  plugins: {
    legend: {
      position: 'right'
    }
  }
}

export default function TransformChart(props) {
  const [transform, setTransform] = useState('timeOfDay')

  const binSeries = props.processedSeries.map(s => {

    // const transforms = {
    //   timeOfDay: {
    //     key: ['hour'],
    //     bins: [Array(24).fill().map((_, i) => i)],
    //   },
    //   month: {
    //     key: ['month'],
    //     bins: [Array(12).fill().map((_, i) => i + 1)],
    //   },
    //   timeOfWeekday: {
    //     key: ['weekday', 'hour'],
    //     bins: Array(7).fill().map((_, weekday) => Array(24).fill().map((_, hour) => [weekday, hour])),
    //   },
    // }

    if (transform === 'timeOfDay') {
      const pricePerHour = Array(24).fill()
        .map((_, h) => s.tradingData.filter(p => p.x.hour === h && !isNaN(p.y)).map(p => p.y))
      const averagePerHour = pricePerHour.map((range, i) => ({
        x: '' + i,
        y: range.reduce((sum, y) => sum + y, 0) / range.length
      }));
      // const stdPerHour = pricePerHour.map((range, i) => Math.sqrt(range.reduce((sum, y) => sum + (y - averagePerHour[i])**2, 0) / range.length));

      return [{
        label: s.label,
        bin: averagePerHour
      }];
    } else if (transform === 'timeOfWeekday') {
      const pricePerWeekday = Array(7).fill()
        .map((_, weekday) => Array(24).fill().map((_, hour) => s.tradingData
          .filter(p => p.x.weekday === weekday + 1 && p.x.hour === hour && !isNaN(p.y))
          .map(p => p.y)
        ))
      const averagePerDay = pricePerWeekday.map((weekday, label) => ({
        label: s.label + ' ' + weekDayNames[label], 
        bin: weekday.map((range, i) => ({
          x: '' + i,
          y: range.reduce((sum, y) => sum + y, 0) / range.length,
        }))
      }));
      // const stdPerDay = pricePerDay.map((range, i) => Math.sqrt(range.reduce((sum, y) => sum + (y - pricePerDay[i])**2, 0) / range.length));

      return averagePerDay;
    } else if (transform === 'month') {
      const pricePerMonth = Array(12).fill().map((_, i) => i + 1)
        .map((m) => ({
          x: m,
          w: s.tradingData.filter(p => p.x.month === m && !isNaN(p.y)).map(p => p.y),
        }))
      const averagePerMonth = pricePerMonth
        .map(range => ({
          x: '' + range.x,
          y: range.w.reduce((sum, y) => sum + y, 0) / range.w.length
        }));
      // const stdPerHour = pricePerMonth.map((range, i) => Math.sqrt(range.reduce((sum, y) => sum + (y - averagePerMonth[i])**2, 0) / range.length));

      return [{
        label: s.label, 
        bin: averagePerMonth,
      }];
    }


    // const pricePerDay = [1, 8]
    //   .map((month) => Array(24).fill().map((_, hour) => tradingDataDate
    //     .filter(p => p.x.month === month + 1 && p.x.hour === hour)
    //     .map(p => p.y)
    //   ))
    // const averagePerDay = pricePerDay.map(gurkburk => gurkburk.map(range => range.reduce((sum, y) => sum + y, 0) / range.length));
    // const stdPerDay = pricePerDay.map((range, i) => Math.sqrt(range.reduce((sum, y) => sum + (y - pricePerDay[i])**2, 0) / range.length));

    // const pricePerMonth = Array(12).fill()
    //   .map((_, h) => tradingData.filter(p => Number(p.x.slice(5, 7)) === h + 1).map(p => p.y))
    // const averagePerMonth = pricePerMonth.map(range => range.reduce((sum, y) => sum + y, 0) / range.length);
    // const stdPerMonth = pricePerMonth.map((range, i) => Math.sqrt(range.reduce((sum, y) => sum + (y - averagePerMonth[i])**2, 0) / range.length));

    // console.log('averagePerHour', max, averagePerHour, stdPerHour);
    
  }).flat();

  const dataHourOfDay = {
    datasets: binSeries.map((area, i) => ({
      label: area.label,
      data: area.bin,
      // fill: true,
      backgroundColor: colors[i],
      borderColor: colors[i],
      // pointRadius: 0,
      // borderWidth: 1,
    }))
  }

  return (
    <>
      <div style={{ position: 'fixed', marginLeft: 35 }}>
        <HTMLSelect value={transform} onChange={e => setTransform(e.currentTarget.value)}>
          <option value={'timeOfDay'}>Time of day</option>
          <option value={'timeOfWeekday'}>Time of weekday</option>
          <option value={'month'}>Month</option>
        </HTMLSelect>
      </div>
      <Chart type="line" data={dataHourOfDay} options={optionsTransform}/>
    </>
  )
}