import { useState } from 'react';
import {
  HTMLSelect,
} from "@blueprintjs/core";
import { Chart } from 'react-chartjs-2';
import { colors } from './utils';

const optionsTransform = {
  maintainAspectRatio: false,
  scales: {
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

  const dataHourOfDay = {
    datasets: props.processedSeries.map((area, i) => ({
      label: area.label,
      data: area.binAverage.map((price, hour) => ({ x: '' + hour, y: price })),
      // fill: true,
      backgroundColor: colors[i],
      borderColor: colors[i],
      // pointRadius: 0,
      // borderWidth: 1,
    }))
    // datasets: averagePerDay.map((data, weekDay)  => ({
    //   label: weekDayNames[weekDay],
    //   data: data.map((price, hour) => ({ x: '' + hour, y: price })),
    //   // fill: true,
    //   // backgroundColor: colors[weekDay],
    //   borderColor: colors[weekDay],
    //   // pointRadius: 0,
    //   // borderWidth: 1,
    // }))
  }

  return (
    <>
      <div style={{ position: 'fixed', marginLeft: 35 }}>
        <HTMLSelect value={transform} onChange={e => setTransform(e.currentTarget.value)}>
          <option value={'timeOfDay'}>Time of day</option>
        </HTMLSelect>
      </div>
      <Chart type="line" data={dataHourOfDay} options={optionsTransform}/>
    </>
  )
}