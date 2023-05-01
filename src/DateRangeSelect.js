import { DateTime } from 'luxon';
import { DateRangeInput2 } from "@blueprintjs/datetime2";

// { key: 'Full', from: DateTime.fromISO('2000-01-01') },
// ...Array(DateTime.now().year - 2015).fill().map((_, i) => 2016 + i)
// .map(year => ({ key: '' + year, from: DateTime.fromISO(year + '-01-01')})),

const minDate = DateTime.fromISO('2015-01-01');
const maxDate = DateTime.now().plus({ days: 2 });

const now = DateTime.now();
export const rangeShortcuts = [
  { label: 'Past Week',    dateRange: [now.minus({ weeks:  1 }), null] },
  { label: 'Past 2 Weeks', dateRange: [now.minus({ weeks:  2 }), null] },
  { label: 'Past Month',   dateRange: [now.minus({ months: 1 }), null] },
  { label: 'Past 2 Month', dateRange: [now.minus({ months: 2 }), null] },
  { label: 'Past Year',    dateRange: [now.minus({ years:  1 }), null] },
  { label: 'Past 2 Years', dateRange: [now.minus({ years:  2 }), null] },
  { label: '2023->',       dateRange: [DateTime.fromISO('2023-01-01'), null] },
  { label: '2022->',       dateRange: [DateTime.fromISO('2022-01-01'), null] },
  { label: '2022',         dateRange: [DateTime.fromISO('2022-01-01'), DateTime.fromISO('2023-01-01').minus({day:1})] },
  { label: '2021->',       dateRange: [DateTime.fromISO('2021-01-01'), null] },
  { label: '2021',         dateRange: [DateTime.fromISO('2021-01-01'), DateTime.fromISO('2022-01-01').minus({day:1})] },
  { label: '2020->',       dateRange: [DateTime.fromISO('2020-01-01'), null] },
  { label: '2020',         dateRange: [DateTime.fromISO('2020-01-01'), DateTime.fromISO('2021-01-01').minus({day:1})] },
  { label: 'Full',         dateRange: [minDate, null] },
]

export default function DateRangeSelect(props) {
  return <DateRangeInput2
    fill
    highlightCurrentDay
    value={props.value.map(d => d?.toJSDate())}
    onChange={r => props.onChange(r.map(d => d === null ? null : DateTime.fromJSDate(d)))}
    shortcuts={rangeShortcuts.map(mapDate2LuxonRange)}
    formatDate={d => DateTime.fromJSDate(d).toFormat('yyyy-MM-dd')}
    parseDate={s => new Date(s)}
    minDate={minDate.toJSDate()}
    maxDate={maxDate.toJSDate()}
  />
}

const mapDate2LuxonRange = ({ label, dateRange }) => ({ label, dateRange: [dateRange[0]?.toJSDate(), dateRange[1]?.toJSDate() ] })