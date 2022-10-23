export const weekDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// export const colors = ['red', 'maroon', 'olive', 'lime', 'green', 'aqua', 'teal', 'yellow'];
// export const colors = ['#d11141', '#00b159', '#00aedb', '#f37735', '#ffc425'];
export const colors = ['#d11141', '#00b159', '#00aedb', '#f37735', '#ffc425', '#cccccc', '#8c8c8c'];

export function adjustHexOpacity(colorIndex, opacity) {
  const colorIndexMod = colorIndex % colors.length;

  const r = parseInt(colors[colorIndexMod].slice(1, 3), 16);
  const g = parseInt(colors[colorIndexMod].slice(3, 5), 16);
  const b = parseInt(colors[colorIndexMod].slice(5, 7), 16);

  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
}

export const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const yearsNames = [2019, 2020, 2021, 2022, 2023];