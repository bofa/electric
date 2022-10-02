
function indexOfMax(arr) {
  if (arr.length === 0) {
    // console.log('Negavite!');
    return NaN;
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

function splitTradeFunc(startIndex, stopIndex, data, cycleLoss) {
  const newRange = data.slice(startIndex, stopIndex);
  const potentialValue = newRange.map((v, i, a) => [(1-cycleLoss) * Math.max(...a.slice(0, i)) - v, i + startIndex, indexOfMax(a.slice(0, i)) + startIndex]);
  const bestTrade = potentialValue[indexOfMax(potentialValue.map(d => d[0]))];
  
  if (bestTrade[0] <= 0) {
    // console.log('bestTrade', cycleLoss, startIndex, stopIndex, bestTrade, potentialValue);
    const profit = (1-cycleLoss) * data[stopIndex] - data[startIndex];
    return [profit, startIndex, stopIndex];
  }
  
  const s1 = splitTradeFunc(startIndex, bestTrade[2], data, cycleLoss);
  const s2 = splitTradeFunc(bestTrade[1], stopIndex, data, cycleLoss);
  const b = bestTradeFunc(s1[2], s2[1], data, cycleLoss);

  return [].concat(s1, b, s2);
}

function bestTradeFunc (startIndex, stopIndex, data, cycleLoss) {
  if (startIndex === stopIndex) {
    return [];
  }
  // console.log('call', startIndex, stopIndex);

  const newRange = data.slice(startIndex, stopIndex);

  const potentialValue = newRange.map((v, i, a) => [(1-cycleLoss) * Math.max(...a.slice(i)) - v, i + startIndex, indexOfMax(a.slice(i)) + i + startIndex]);
  const bestTrade = potentialValue[indexOfMax(potentialValue.map(d => d[0]))];

  // console.log('bestTrade', bestTrade);

  if (!bestTrade || bestTrade[0] <= 0) {
    return [];
  } 

  const range1 = bestTradeFunc(startIndex, bestTrade[1], data, cycleLoss);
  const range2 = bestTradeFunc(bestTrade[2], stopIndex, data, cycleLoss);

  const splitTrade = splitTradeFunc(bestTrade[1], bestTrade[2], data, cycleLoss);
  // const splitTrade = bestTrade;

  return range1.concat(splitTrade).concat(range2);
  // return range1.concat(bestTrade).concat(range2);
}

export default function trade(data, cycleLoss) {
  console.log('data', data, cycleLoss);

  const trades = bestTradeFunc(0, data.length, data, cycleLoss);

  return trades;
}