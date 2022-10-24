import {HTMLSelect } from "@blueprintjs/core";

export const confidenceTransforms = [
  {
    key: 'off',
    name: 'off',
    transform: s => ({ min: [], max: []})
  },
  {
    key: 'minmax',
    name: 'min/max',
    transform: (raw, average) => {
      const min = raw.map((range, i) => ({ x: average[i].x, y: Math.min(...range) }))
      const max = raw.map((range, i) => ({ x: average[i].x, y: Math.max(...range) }))

      return { min, max };
    }
  },
  {
    key: 'std1',
    name: '±σ',
    transform: (raw, average) => {
      const std = raw.map((range, i) => Math.sqrt(range.reduce((sum, y) => sum + (y - average[i].y)**2, 0) / range.length))
      const min = std.map((std, i) => ({ x: average[i].x, y: average[i].y - std }));
      const max = std.map((std, i) => ({ x: average[i].x, y: average[i].y + std }));

      return { min, max };
    }
  },
  {
    key: 'std2',
    name: '±2σ',
    transform: (raw, average) => {
      const std = raw.map((range, i) => Math.sqrt(range.reduce((sum, y) => sum + (y - average[i].y)**2, 0) / range.length))
      const min = std.map((std, i) => ({ x: average[i].x, y: average[i].y - 2*std }));
      const max = std.map((std, i) => ({ x: average[i].x, y: average[i].y + 2*std }));

      return { min, max };
    }
  },
]

export default function SelectConfidence(props) {
  return (
    <HTMLSelect value={props.confidence} onChange={e => props.setConfidence(e.currentTarget.value)}>
      {confidenceTransforms.map(({ key, name }) =>
        <option value={key}>{name}</option>
      )}
    </HTMLSelect>
  )
}