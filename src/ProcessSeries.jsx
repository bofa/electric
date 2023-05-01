function ProcessSeries(series, windowSizeHours, samplingSizeHours, confidenceTransform, lowerDate, upperDate) {

  const tradingData = series.data.slice(
    series.data.findIndex(p => p.x - lowerDate > 0),
    series.data.findLastIndex(p => p.x - upperDate < 0)
  );

  const sampling = tradingData[1].x.diff(tradingData[0].x, 'hours').hours;  
  const samplingSize = Math.max(1, Math.round(samplingSizeHours / sampling));
  const windowSize = Math.max(1, Math.round(windowSizeHours / sampling));

  // const tradingData = rangeDataSet
  //   .map(p => ({
  //     x: p.x,
  //     y: p[area] === null ? NaN : p[area],
  //   }))
  // const trades = trade(tradingData.map(d => d.y), 0.20, 24)
  // const sum = trades.filter((t, i) => i % 3 === 0).reduce((sum, value) => sum + value);

  // FFT
  // if (tradingData.length > 0) {
  //   const fftInput = tradingData
  //     .slice(0, 2 ** 13)
  //     .map(p => p.y);
  //   console.log('fftInput', fftInput, tradingData.length);
  //   const phasors = fft(fftInput);
  //   console.log('phasors', phasors);
  //   const frequencies = fftUtil.fftFreq(phasors, 8000) // Sample rate and coef is just used for length, and frequency step
  //   const magnitudes = fftUtil.fftMag(phasors);

  //   console.log('frequencies', magnitudes, frequencies);
  // }

  // const buy = trades.filter((t, i) => i % 3 === 1)
  //   .map(t => tradingData[t])
  
  // const sell = trades.filter((t, i) => i % 3 === 2)
  //   .map(t => tradingData[t])

  // const windowSize = 24;
  const ranges = tradingData.slice(windowSize-1).map((p, i) => {
    return tradingData.slice(i, i + windowSize)
  })
  
  const movingAverage = ranges.map((sampledWindow, i) => {
    const sampledWindowFiltered = sampledWindow.filter(p => !isNaN(p.y))

    const N = sampledWindowFiltered.length;
    const m = sampledWindowFiltered.reduce((s, p) => s + p.y, 0) / N;

    return {
      x: sampledWindow.at(-1).x,
      y: m,
    }
  })
    
  const { min, max } = confidenceTransform(ranges.map(r => r.map(p => p.y)), movingAverage);

  return {
    label: series.label,
    tradingData: tradingData,
    movingAverage: movingAverage.filter((_, i, a) => i % samplingSize === 0 || i === a.length - 1),
    min: min.filter((_, i, a) => i % samplingSize === 0 || i === a.length - 1),
    max: max.filter((_, i, a) => i % samplingSize === 0 || i === a.length - 1),
    // binAverage: averagePerHour,
    // buy,
    // sell,
  }
}

let cache = {};
const memoize = (series, range, windowSize, samplingSize, confidence, confidenceTransform, lowerDate, upperDate) => {
  const triggerKeys = [series.label, series.data.length, range, windowSize, samplingSize, confidence, lowerDate.toISO(), upperDate?.toISO()];
  let n = triggerKeys.join('|');
  if (n in cache) {
    return cache[n];
  }
  else {
    let result = ProcessSeries(series, windowSize, samplingSize, confidenceTransform, lowerDate, upperDate);
    cache[n] = result;
    return result;
  }
}

export default memoize;