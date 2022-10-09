function indexOfMax(arr) {
  if (arr.length === 0) {
      return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
          maxIndex = i;
          max = arr[i];
      }
  }

  return maxIndex;
}

const data = [
  { t: '2021-10-24T23:00:00', y: 1.79 }, 
  { t: '2021-10-24T22:00:00', y: 14.42 }, 
  { t: '2021-10-24T21:00:00', y: 66.98 }, 
  { t: '2021-10-24T20:00:00', y: 96.91 }, 
  { t: '2021-10-24T19:00:00', y: 99.43 }, 
  { t: '2021-10-24T18:00:00', y: 100.77 },
  { t: '2021-10-24T17:00:00', y: 103.97 },
  { t: '2021-10-24T16:00:00', y: 87.28 }, 
  { t: '2021-10-24T15:00:00', y: 18.14 }, 
  { t: '2021-10-24T14:00:00', y: 20.53 }, 
  { t: '2021-10-24T13:00:00', y: 21.97 }, 
  { t: '2021-10-24T12:00:00', y: 26.89 }, 
  { t: '2021-10-24T11:00:00', y: 77.68 }, 
  { t: '2021-10-24T10:00:00', y: 80.91 }, 
  { t: '2021-10-24T09:00:00', y: 81.45 }, 
  { t: '2021-10-24T08:00:00', y: 73.8 },  
  { t: '2021-10-24T07:00:00', y: 70.99 }, 
  { t: '2021-10-24T06:00:00', y: 69.65 }, 
  { t: '2021-10-24T05:00:00', y: 70.6 },  
  { t: '2021-10-24T04:00:00', y: 65.62 }, 
  { t: '2021-10-24T03:00:00', y: 65.51 }, 
  { t: '2021-10-24T02:00:00', y: 65.61 }, 
  { t: '2021-10-24T01:00:00', y: 67.21 }, 
  { t: '2021-10-24T00:00:00', y: 56.42 }, 
  { t: '2021-10-25T23:00:00', y: 70.1 },
  { t: '2021-10-25T22:00:00', y: 96.73 },
  { t: '2021-10-25T21:00:00', y: 101.82 },
  { t: '2021-10-25T20:00:00', y: 104.14 },
  { t: '2021-10-25T19:00:00', y: 150.05 },
  { t: '2021-10-25T18:00:00', y: 205.62 },
  { t: '2021-10-25T17:00:00', y: 150.05 },
  { t: '2021-10-25T16:00:00', y: 128.25 },
  { t: '2021-10-25T15:00:00', y: 115.2 },
  { t: '2021-10-25T14:00:00', y: 110.87 },
  { t: '2021-10-25T13:00:00', y: 104.8 },
  { t: '2021-10-25T12:00:00', y: 110.89 },
  { t: '2021-10-25T11:00:00', y: 110.99 },
  { t: '2021-10-25T10:00:00', y: 111.94 },
  { t: '2021-10-25T09:00:00', y: 118.35 },
  { t: '2021-10-25T08:00:00', y: 130.01 },
  { t: '2021-10-25T07:00:00', y: 130 },
  { t: '2021-10-25T06:00:00', y: 97.8 },
  { t: '2021-10-25T05:00:00', y: 80 },
  { t: '2021-10-25T04:00:00', y: 14.86 },
  { t: '2021-10-25T03:00:00', y: 14.25 },
  { t: '2021-10-25T02:00:00', y: 14.2 },
  { t: '2021-10-25T01:00:00', y: 14.18 },
  { t: '2021-10-25T00:00:00', y: 13.91 },
  { t: '2021-10-26T23:00:00', y: 65.1 },
  { t: '2021-10-26T22:00:00', y: 77.8 },
  { t: '2021-10-26T21:00:00', y: 103.5 },
  { t: '2021-10-26T20:00:00', y: 103.81 },
  { t: '2021-10-26T19:00:00', y: 205.5 },
  { t: '2021-10-26T18:00:00', y: 230.09 },
  { t: '2021-10-26T17:00:00', y: 210.92 },
  { t: '2021-10-26T16:00:00', y: 105.37 },
  { t: '2021-10-26T15:00:00', y: 103.72 },
  { t: '2021-10-26T14:00:00', y: 105.58 },
  { t: '2021-10-26T13:00:00', y: 107.93 },
  { t: '2021-10-26T12:00:00', y: 192.3 },
  { t: '2021-10-26T11:00:00', y: 207.13 },
  { t: '2021-10-26T10:00:00', y: 214.62 },
  { t: '2021-10-26T09:00:00', y: 229.42 },
  { t: '2021-10-26T08:00:00', y: 240.01 },
  { t: '2021-10-26T07:00:00', y: 230.05 },
  { t: '2021-10-26T06:00:00', y: 108.91 },
  { t: '2021-10-26T05:00:00', y: 92.02 },
  { t: '2021-10-26T04:00:00', y: 75.07 },
  { t: '2021-10-26T03:00:00', y: 75.02 },
  { t: '2021-10-26T02:00:00', y: 67.02 },
  { t: '2021-10-26T01:00:00', y: 67.07 },
  { t: '2021-10-26T00:00:00', y: 75.05 },
  { t: '2021-10-27T23:00:00', y: 6.75 },
  { t: '2021-10-27T22:00:00', y: 11.9 },
  { t: '2021-10-27T21:00:00', y: 13.78 },
  { t: '2021-10-27T20:00:00', y: 15.08 },
  { t: '2021-10-27T19:00:00', y: 67.06 },
  { t: '2021-10-27T18:00:00', y: 73.22 },
  { t: '2021-10-27T17:00:00', y: 67.3 },
  { t: '2021-10-27T16:00:00', y: 14.95 },
  { t: '2021-10-27T15:00:00', y: 14.83 },
  { t: '2021-10-27T14:00:00', y: 15.03 },
  { t: '2021-10-27T13:00:00', y: 16.51 },
  { t: '2021-10-27T12:00:00', y: 16.98 },
  { t: '2021-10-27T11:00:00', y: 25.07 },
  { t: '2021-10-27T10:00:00', y: 30.79 },
  { t: '2021-10-27T09:00:00', y: 63.13 },
  { t: '2021-10-27T08:00:00', y: 67.03 },
  { t: '2021-10-27T07:00:00', y: 67 },
  { t: '2021-10-27T06:00:00', y: 14.02 },
  { t: '2021-10-27T05:00:00', y: 12.71 },
  { t: '2021-10-27T04:00:00', y: 12.38 },
  { t: '2021-10-27T03:00:00', y: 13.19 },
  { t: '2021-10-27T02:00:00', y: 15.02 },
  { t: '2021-10-27T01:00:00', y: 16.9 },
  { t: '2021-10-27T00:00:00', y: 17.21 },
  { t: '2021-10-28T23:00:00', y: 12.11 },
  { t: '2021-10-28T22:00:00', y: 13.99 },
  { t: '2021-10-28T21:00:00', y: 25.09 },
  { t: '2021-10-28T20:00:00', y: 77.83 },
].map(d => d.y);

// Unit [EUR/MWh]
const cycleLoss = 0.2;
const forsight = 24;

// const maxIndex = indexOfMax(data);

// const potentialValue = data.map((v, i, a) => [(1-cycleLoss) * Math.max(...a.slice(i)) - v, i, indexOfMax(a.slice(i)) + i]);
// const bestTrade = potentialValue[indexOfMax(potentialValue.map(d => d[0]))];

// data.reduceRight((agg, value, index, array) => {
//   array.slice(); 
//   array.slice(i)
// })

// console.log('potentialValue', potentialValue);
// console.log('bestTrade', bestTrade);

// function trade(charged, index) {
//   if (index === data.length) {
//     return 0;
//   }

//   const hold = trade(charged, index + 1);
//   if (charged) {
//     const sell = trade(false, index + 1) + 0.8 * data[index];
//     return Math.max(hold, sell);
//   } else {
//     const buy = trade(true, index + 1) - data[index];
//     return Math.max(hold, buy);
//   }
// }

// const test = trade(0, 0);

// console.log('test', test);

function splitTradeFunc(startIndex, stopIndex) {
  console.log('splitTrade', startIndex, stopIndex);
  
  const newRange = data.slice(startIndex, stopIndex);
  const potentialValue = newRange.map((v, i, a) => [(1-cycleLoss) * Math.max(...a.slice(0, i)) - v, i + startIndex, indexOfMax(a.slice(0, i)) + startIndex]);
  const bestTrade = potentialValue[indexOfMax(potentialValue.map(d => d[0]))];

  console.log('splitTradeBest', bestTrade);

  if (bestTrade[0] <= 0) {
    const profit = (1-cycleLoss) * data[stopIndex] - data[startIndex];
    return [profit, startIndex, stopIndex];
  }
  
  // return ['*', startIndex, bestTrade[2], '*', bestTrade[1], stopIndex];
  return [].concat(splitTradeFunc(startIndex, bestTrade[2]), splitTradeFunc(bestTrade[1], stopIndex))
}

function bestTradeFunc (startIndex, stopIndex) {
  // console.log('call', startIndex, stopIndex);

  const newRange = data.slice(startIndex, stopIndex);

  const potentialValue = newRange.map((v, i, a) => [(1-cycleLoss) * Math.max(...a.slice(i)) - v, i + startIndex, indexOfMax(a.slice(i)) + i + startIndex]);
  const bestTrade = potentialValue[indexOfMax(potentialValue.map(d => d[0]))];

  // console.log('bestTrade', bestTrade);

  if (!bestTrade || bestTrade[0] <= 0) {
    return [];
  } 

  const range1 = bestTradeFunc(startIndex, bestTrade[1]);
  const range2 = bestTradeFunc(bestTrade[2], stopIndex);

  const splitTrade = splitTradeFunc(bestTrade[1], bestTrade[2]);
  // const splitTrade = bestTrade;

  return range1.concat(splitTrade).concat(range2);
}

const trades = bestTradeFunc(0, data.length);

console.log('trades', trades);

const sum = []
for (let i = 0; i < trades.length; i += 3) {
  const startIndex = trades[i + 1];
  const stopIndex = trades[i + 2] ;
  const profit = (1-cycleLoss) * data[stopIndex] - data[startIndex];

  sum.push(profit);
}

console.log('sum', sum.reduce((sum, value) => sum + value));
// let maxIndex;
// const trades = [];
