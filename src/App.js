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

const areas = Object.keys(fullDataSet[0]).filter(item => item !== 't');

const options = {
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: 300
    }
  }
}

function App () {
  const [area, setArea] = React.useState('SE3');
  const [windowSize, setWindowSize] = React.useState(24);
  // const trades = trade(tradingData.map(d => d.y), 0.20)

  // const buy = trades.filter((t, i) => i % 3 === 1)
  //   .map(t => tradingData[t])
  //   .map(({ t, y }) => ({ x: t, y }));
  
  // const sell = trades.filter((t, i) => i % 3 === 2)
  //   .map(t => tradingData[t])
  //   .map(({ t, y }) => ({ x: t, y }));

  // const sum = trades.filter((t, i) => i % 3 === 0).reduce((sum, value) => sum + value);
  // const area = 'SE3';
  const tradingData = fullDataSet.map(p => ({
    x: p.t,
    y: p[area],
  })); // .slice(0, 100);

  // const windowSize = 24;
  const movingAverage = tradingData.map((v, i) => ({
    x: v.x,
    y: i < windowSize
      ? NaN
      : tradingData.slice(i - windowSize + 1, i + 1).reduce((s, p) => s + p.y, 0) / windowSize
  }));
    
  console.log('tradingData', tradingData);
  
  // const max = Math.max(...tradingData.map(p => p.y))
  
  const pricePerHour = Array(24).fill()
    .map((_, h) => tradingData.filter(p => Number(p.x.slice(11, 13)) === h).map(p => p.y))
  const averagePerHour = pricePerHour.map(range => range.reduce((sum, y) => sum + y, 0) / range.length);
  const stdPerHour = pricePerHour.map((range, i) => Math.sqrt(range.reduce((sum, y) => sum + (y - averagePerHour[i])**2, 0) / range.length));

  const pricePerMonth = Array(12).fill()
    .map((_, h) => tradingData.filter(p => Number(p.x.slice(5, 7)) === h + 1).map(p => p.y))
  const averagePerMonth = pricePerMonth.map(range => range.reduce((sum, y) => sum + y, 0) / range.length);
  const stdPerMonth = pricePerMonth.map((range, i) => Math.sqrt(range.reduce((sum, y) => sum + (y - averagePerMonth[i])**2, 0) / range.length));

  // console.log('averagePerHour', max, averagePerHour, stdPerHour);

  const dataTimeSeries = {
    datasets: [
      // {
      //   label: 'Price',
      //   data: tradingData,
      //   fill: false,
      //   backgroundColor: 'rgb(255, 99, 132)',
      //   borderColor: 'rgba(255, 99, 132, 1)',
      //   pointRadius: 0,
      //   borderWidth: 1,
      // },
      {
        label: 'Moving Average',
        data: movingAverage,
        fill: false,
        backgroundColor: 'rgb(10, 99, 132)',
        borderColor: 'rgba(10, 99, 132, 1)',
        pointRadius: 0,
        borderWidth: 1,
      },
      // {
      //   type: 'scatter',
      //   label: 'Buy',
      //   data: buy,
      //   fill: false,
      //   backgroundColor: 'green',
      //   radius: 7,
      //   // borderColor: 'rgba(25, 99, 132, 0.2)',
      // },
      // {
      //   type: 'scatter',
      //   label: 'Sell',
      //   data: sell,
      //   fill: false,
      //   backgroundColor: 'red',
      //   radius: 7,
      //   // borderColor: 'rgba(25, 99, 132, 0.2)',
      // },
    ],
  };

  const dataHourOfDay = {
    datasets: [
      {
        label: 'Hourly Average Price',
        data: averagePerHour.map((price, hour) => ({ x: '' + hour, y: price })),
        // fill: true,
        // backgroundColor: 'rgb(10, 99, 132)',
        // borderColor: 'rgba(10, 99, 132, 1)',
        // pointRadius: 0,
        // borderWidth: 1,
      },
      // {
      //   label: 'Monthly Average Price',
      //   data: averagePerMonth.map((price, month) => ({ x: '' + (month + 1), y: price })),
      //   // fill: true,
      //   // backgroundColor: 'rgb(10, 99, 132)',
      //   // borderColor: 'rgba(10, 99, 132, 1)',
      //   // pointRadius: 0,
      //   // borderWidth: 1,
      // },
    ]
  }

  return (
    <div className="App" style={{ padding: 20}}>
      <Navbar>
        <NavbarGroup>
          <HTMLSelect onChange={e => setArea(e.currentTarget.value)}>
            {areas.map(a => <option selected={a === area} value={a}>{a}</option>)}
          </HTMLSelect>
          <NavbarDivider/>
          <HTMLSelect onChange={e => setWindowSize(e.currentTarget.value)}>
            <option selected={windowSize === 1} value={1}>Hour</option>
            <option selected={windowSize === 8} value={8}>8 Hours</option>
            <option selected={windowSize === 24} value={24}>Day</option>
            <option selected={windowSize === 24*7} value={24*7}>Week</option>
            <option selected={windowSize === 24*30} value={24*30}>Month</option>
          </HTMLSelect>
          <NavbarDivider/>
          {/* <AreaMultiSelect areas={areas}/> */}
        </NavbarGroup>
      </Navbar>
      <div style={{ height: 'calc(50vh - 60px)' }}>
        <Chart type="line" data={dataTimeSeries} options={options}/>
     </div>
      <div style={{ height: 'calc(50vh - 60px)' }}>
        <Chart type="line" data={dataHourOfDay} options={options}/>
      </div>
      {/* {Math.round(sum)}EUR, {Math.round(sum/tradingData.length)}EUR/h, {Math.round(24 * 365 * sum/tradingData.length)}EUR/y */}
    </div>
  );
}

export default App;
