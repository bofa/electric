import {
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  HTMLSelect,
} from "@blueprintjs/core";
import React from 'react';
import 'chart.js/auto';
// import 'chartjs-adapter-luxon';
import { Chart } from 'react-chartjs-2';
// import fullDataSet from './data.json';
import AreaMultiSelect from './AreaMultiSelect';
import './App.css';
import trade from './trading';
import { DateTime } from 'luxon';
import axios from 'axios';

// Add link to
// https://www.nordpoolgroup.com/en/the-power-market/Day-ahead-market/#:~:text=The%20daily%20process,delivery%20hours%20the%20next%20day.

const weekDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const colors = ['red', 'maroon', 'olive', 'lime', 'green', 'aqua', 'teal', 'yellow']

const options = {
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: 250
      },
    // x: {
    //   type: 'time',
    //   time: {
    //     // Luxon format string
    //     tooltipFormat: 'DD T'
    //   },
    //   title: {
    //     display: true,
    //     text: 'Date'
    //   }
    // },
  },
  animation: false,
  normalized: true,
  // spanGaps: true
  // parsing: false,
}

function App () {
  const [selectedAreas, setSelectedAreas] = React.useState(['SE3']);
  const [windowSize, setWindowSize] = React.useState(24);
  const [samplingSize, setSamplingSize] = React.useState(24);
  const [range, setRange] = React.useState('Full');
  const [selectDataSet, setSelectDataSet] = React.useState('priceDataSet');
  const [priceDataSet, setPriceDataSet] = React.useState([{}]);
  const [consumptionDataSet, setConsumptionDataSet] = React.useState([{}]);
  const [productionDataSet, setProductionDataSet] = React.useState([{}]);
  
  React.useEffect(() => {
    axios.get('https://raw.githubusercontent.com/bofa/electric/master/data.json')
      .then(response => setPriceDataSet(response.data));
    axios.get('https://raw.githubusercontent.com/bofa/electric/master/consumption.json')
      .then(response => setConsumptionDataSet(response.data));
    axios.get('https://raw.githubusercontent.com/bofa/electric/master/production.json')
      .then(response => setProductionDataSet(response.data));
  }, [])

  const fullDataSet = { priceDataSet, consumptionDataSet, productionDataSet }[selectDataSet];
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

  const rangeDataSet = fullDataSet.filter(p => DateTime.fromISO(p.x) - lowerDate > 0);

  const processedSeries = selectedAreas.map(area => {
    const tradingData = rangeDataSet
      .map(p => ({
        x: p.x,
        y: p[area],
      }))
      .filter(p => p.y !== null)
    // const trades = trade(tradingData.map(d => d.y), 0.20, 24)
    // const sum = trades.filter((t, i) => i % 3 === 0).reduce((sum, value) => sum + value);

    // console.log('sum', sum);

    // const buy = trades.filter((t, i) => i % 3 === 1)
    //   .map(t => tradingData[t])
    
    // const sell = trades.filter((t, i) => i % 3 === 2)
    //   .map(t => tradingData[t])

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
      // buy,
      // sell,
    }
  })

  const dataTimeSeries = {
    datasets: 
      processedSeries.map((area, i) => [{
        type: windowSize === 1 ? 'scatter' : 'line',
        label: area.label,
        data: area.movingAverage
          .filter((_, i, a) => i % samplingSize === 0 || i === a.length - 1)

          ,
        fill: false,
        backgroundColor: colors[i],
        borderColor: colors[i],
        pointRadius: windowSize === 1 ? 1 : 0,
        borderWidth: 1,
      },
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
    ]).flat()
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
            Param
          </NavbarHeading>
          <HTMLSelect value={selectDataSet} onChange={e => setSelectDataSet(e.currentTarget.value)}>
            <option value={'priceDataSet'}>Price</option>
            <option value={'consumptionDataSet'}>Consumption</option>
            <option value={'productionDataSet'}>Production</option>
          </HTMLSelect>
          <NavbarDivider/>
          <NavbarHeading>
            Smooth
          </NavbarHeading>
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
          <NavbarDivider/>
          <NavbarHeading>
            Samp
          </NavbarHeading>
          <HTMLSelect value={samplingSize} onChange={e => setSamplingSize(Number(e.currentTarget.value))}>
            {[1, 24, 24*7].filter(v => v <= windowSize).map(v => <option value={v}>{v}</option>)}
          </HTMLSelect>
          <NavbarDivider/>
          <NavbarHeading>
            Range
          </NavbarHeading>
          <HTMLSelect value={range} onChange={e => setRange(e.currentTarget.value)}>
            {['Full', 'Past Year', 'Past Month', 'Past Week'].map(v => <option value={v}>{v}</option>)}
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
