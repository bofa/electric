import React from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import tradingData from './data.json';
import './App.css';
import trade from './trading';

function App () {
  const trades = trade(tradingData.map(d => d.y), 0.20)

  const buy = trades.filter((t, i) => i % 3 === 1)
    .map(t => tradingData[t])
    .map(({ t, y }) => ({ x: t, y }));
  
  const sell = trades.filter((t, i) => i % 3 === 2)
    .map(t => tradingData[t])
    .map(({ t, y }) => ({ x: t, y }));

  const sum = trades.filter((t, i) => i % 3 === 0).reduce((sum, value) => sum + value);

  const data = {
    datasets: [
      {
        label: 'Price',
        data: tradingData.map(({ t, y }) => ({ x: t, y })),
        fill: false,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgba(255, 99, 132, 0.2)',
      },
      {
        type: 'scatter',
        label: 'Buy',
        data: buy,
        fill: false,
        backgroundColor: 'green',
        radius: 7,
        // borderColor: 'rgba(25, 99, 132, 0.2)',
      },
      {
        type: 'scatter',
        label: 'Sell',
        data: sell,
        fill: false,
        backgroundColor: 'red',
        radius: 7,
        // borderColor: 'rgba(25, 99, 132, 0.2)',
      },
    ],
  };

  return (
    <div className="App">
      <Line data={data}/>
      {Math.round(sum)}EUR, {Math.round(sum/tradingData.length)}EUR/h, {Math.round(24 * 365 * sum/tradingData.length)}EUR/y
    </div>
  );
}

export default App;
