import {
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  HTMLSelect,
} from "@blueprintjs/core";
import React from 'react';
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import fullDataSet from './data.json';
import AreaMultiSelect from './AreaMultiSelect';
import './App.css';
import trade from './trading';
import { DateTime } from 'luxon';

const areas = Object.keys(fullDataSet[0]).filter(item => item !== 't');
const weekDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const colors = ['red', 'maroon', 'olive', 'lime', 'green', 'aqua', 'teal', 'yellow']

const options = {
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: 250
    }
  },
  // spanGaps: true
}

function App () {
  const [selectedAreas, setSelectedAreas] = React.useState(['SE3']);
  const [windowSize, setWindowSize] = React.useState(24);
  const [samplingSize, setSamplingSize] = React.useState(24);

  // const trades = trade(tradingData.map(d => d.y), 0.20)

  // const buy = trades.filter((t, i) => i % 3 === 1)
  //   .map(t => tradingData[t])
  //   .map(({ t, y }) => ({ x: t, y }));
  
  // const sell = trades.filter((t, i) => i % 3 === 2)
  //   .map(t => tradingData[t])
  //   .map(({ t, y }) => ({ x: t, y }));

  // const sum = trades.filter((t, i) => i % 3 === 0).reduce((sum, value) => sum + value);
  // const area = 'SE3';
  const processedSeries = selectedAreas.map(area => {
    const tradingData = fullDataSet.map(p => ({
      x: p.t,
      y: p[area],
    }))
    // .slice(0, 6000)

    // const windowSize = 24;
    const movingAverage = tradingData.map((v, i) => ({
      x: v.x,
      y: i < windowSize
        ? NaN
        : tradingData.slice(i - windowSize + 1, i + 1).reduce((s, p) => s + p.y, 0) / windowSize
    }));
      
    // const max = Math.max(...tradingData.map(p => p.y))
    
    const pricePerHour = Array(24).fill()
      .map((_, h) => tradingData.filter(p => Number(p.x.slice(11, 13)) === h).map(p => p.y))
    const averagePerHour = pricePerHour.map(range => range.reduce((sum, y) => sum + y, 0) / range.length);
    const stdPerHour = pricePerHour.map((range, i) => Math.sqrt(range.reduce((sum, y) => sum + (y - averagePerHour[i])**2, 0) / range.length));

    // const tradingDataDate = tradingData.map(p => ({ x: DateTime.fromISO(p.x), y: p.y }))
    // const pricePerDay = Array(7).fill()
    //   .map((_, weekday) => Array(24).fill().map((_, hour) => tradingDataDate
    //     .filter(p => p.x.weekday === weekday + 1 && p.x.hour === hour)
    //     .map(p => p.y)
    //   ))
    // const averagePerDay = pricePerDay.map(gurkburk => gurkburk.map(range => range.reduce((sum, y) => sum + y, 0) / range.length));
    // const stdPerDay = pricePerDay.map((range, i) => Math.sqrt(range.reduce((sum, y) => sum + (y - pricePerDay[i])**2, 0) / range.length));

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

    return {
      label: area,
      movingAverage,
      binAverage: averagePerHour,
    }
  })

  const dataTimeSeries = {
    datasets: processedSeries.map((area, i) => ({
      label: area.label,
      data: area.movingAverage.filter((_, i) => i % samplingSize === 0).map(p => ({ x: p.x.slice(0, 13), y: p.y })),
      fill: false,
      backgroundColor: colors[i],
      borderColor: colors[i],
      pointRadius: 0,
      borderWidth: 1,
    })),
  };

  const dataHourOfDay = {
    datasets: processedSeries.map((area, i) => ({
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
    <div className="App">
      <Navbar>
        <NavbarGroup>
          <AreaMultiSelect
            areas={areas}
            selectedAreas={selectedAreas}
            setSelectedAreas={setSelectedAreas}
          />
          <NavbarDivider/>
          <NavbarHeading>
            Smooth
          </NavbarHeading>
          <HTMLSelect value={windowSize} onChange={e => {
            const newWindowSize = e.currentTarget.value;
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
          <NavbarDivider/>
          <NavbarHeading>
            Samp
          </NavbarHeading>
          <HTMLSelect value={samplingSize} onChange={e => setSamplingSize(e.currentTarget.value)}>
            {[1, 24, 24*7].filter(v => v <= windowSize).map(v => <option value={v}>{v}</option>)}
          </HTMLSelect>
          <NavbarDivider/>
        </NavbarGroup>
      </Navbar>
      <div style={{ height: 'calc(50vh - 60px)', padding: 10 }}>
        <Chart type="line" data={dataTimeSeries} options={options}/>
     </div>
      <div style={{ height: 'calc(50vh - 60px)', padding: 10 }}>
        <Chart type="line" data={dataHourOfDay} options={options}/>
      </div>
      {/* {Math.round(sum)}EUR, {Math.round(sum/tradingData.length)}EUR/h, {Math.round(24 * 365 * sum/tradingData.length)}EUR/y */}
    </div>
  );
}

export default App;
