export const weekDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// export const colors = ['red', 'maroon', 'olive', 'lime', 'green', 'aqua', 'teal', 'yellow'];
export const colors = ['#d11141', '#00b159', '#00aedb', '#f37735', '#ffc425'];

export function adjustHexOpacity(colorIndex, opacity) {
  const r = parseInt(colors[colorIndex].slice(1, 3), 16);
  const g = parseInt(colors[colorIndex].slice(3, 5), 16);
  const b = parseInt(colors[colorIndex].slice(5, 7), 16);

  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
}