import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { Button, ButtonGroup, Drawer, Intent, MultiSlider } from '@blueprintjs/core'

// { key: 'Full', from: DateTime.fromISO('2000-01-01') },
// ...Array(DateTime.now().year - 2015).fill().map((_, i) => 2016 + i)
// .map(year => ({ key: '' + year, from: DateTime.fromISO(year + '-01-01')})),

export const minDate = DateTime.fromISO('2015-01-01');
export const maxDate = DateTime.now().plus({ days: 2 });

const minDays = 0
const maxDays = Math.ceil(maxDate.diff(minDate, 'days').days)

const toDays = (date: DateTime) => date.diff(minDate, 'days').days

const now = DateTime.now();
export const rangeShortcuts = [
  { label: 'Past Week',    dateRange: [now.minus({ weeks:  1 }), maxDate] },
  { label: 'Past 2 Weeks', dateRange: [now.minus({ weeks:  2 }), maxDate] },
  { label: 'Past Month',   dateRange: [now.minus({ months: 1 }), maxDate] },
  { label: 'Past 2 Month', dateRange: [now.minus({ months: 2 }), maxDate] },
  { label: 'Past Year',    dateRange: [now.minus({ years:  1 }), maxDate] },
  { label: 'Past 2 Years', dateRange: [now.minus({ years:  2 }), maxDate] },
  { label: '2023->',       dateRange: [DateTime.fromISO('2023-01-01'), maxDate] },
  { label: '2022->',       dateRange: [DateTime.fromISO('2022-01-01'), maxDate] },
  { label: '2021->',       dateRange: [DateTime.fromISO('2021-01-01'), maxDate] },
  { label: '2020->',       dateRange: [DateTime.fromISO('2020-01-01'), maxDate] },
  { label: '2022',         dateRange: [DateTime.fromISO('2022-01-01'), DateTime.fromISO('2023-01-01').minus({day:1})] },
  { label: '2021',         dateRange: [DateTime.fromISO('2021-01-01'), DateTime.fromISO('2022-01-01').minus({day:1})] },
  { label: '2020',         dateRange: [DateTime.fromISO('2020-01-01'), DateTime.fromISO('2021-01-01').minus({day:1})] },
  { label: 'Full',         dateRange: [minDate, maxDate] },
]

type Range = DateTime[]

export default function DateRangeSelect(props: {
  value: Range
  onChange: (range: Range) => void
}) {
  const [dateOpen, setDateOpen] = React.useState(false);
  const [dateRange, setDateRange] = useState<number[]>([0, 0])
  
  useEffect(() => {
    const rangeDays = props.value.map(toDays)
    setDateRange(rangeDays)
  }, [props.value[0], props.value[1]])

  return (
    <>
    <Button icon="time" onClick={() => setDateOpen(true)}/>

    <Drawer
      isOpen={dateOpen}
      onClose={() => setDateOpen(false)}
      position="top"
      size="auto"
      style={{ padding: 40 }}
    >
      <MultiSlider
        // labelStepSize={2*365}
        // stepSize={100}
        min={minDays}
        max={maxDays}
        onChange={setDateRange}
        onRelease={range => props.onChange(range.map(day => minDate.plus({ day })))}
        labelRenderer={(day, opt) => {
          const date = minDate.plus({ day })
          const isFirstOfYear = date.month === 1 && date.day === 1

          return opt?.isHandleTooltip
            ? <span style={{ whiteSpace: 'nowrap'  }}>{date.toFormat('yy-MM-dd')}</span>
            : isFirstOfYear ? minDate.plus({ day }).toFormat('yyyy')
            : ""
        }}
      >
        <MultiSlider.Handle
          value={dateRange[0]}
          type="start"
          intentAfter={Intent.PRIMARY}
        />
        <MultiSlider.Handle
          value={dateRange[1]}
          type="end"
        />
      </MultiSlider>
      <div style={{ marginTop: 30, display: 'flex', flexWrap: 'wrap' }}>
        {rangeShortcuts.map(range => <Button
          minimal
          text={range.label}
          onClick={() => {
            props.onChange(range.dateRange)
            setDateOpen(false)
          }}
        />)}

      </div>
    </Drawer>
    </>
  )
  
  // return <DateRangeInput2
  //   fill
  //   highlightCurrentDay
  //   popoverProps={props.isOpen === undefined ? undefined : { isOpen: props.isOpen }}
  //   value={props.value.map((d: DateTime) => d?.toJSDate())}
  //   onChange={(r: DateRange) => props.onChange(r.map((d: Date | null) => d === null ? null : DateTime.fromJSDate(d)))}
  //   shortcuts={rangeShortcuts.map(mapLuxon2DateRange)}
  //   formatDate={(d: Date) => DateTime.fromJSDate(d).toFormat('yyyy-MM-dd')}
  //   parseDate={(s: string | number | Date) => new Date(s)}
  //   minDate={minDate.toJSDate()}
  //   maxDate={maxDate.toJSDate()}
  // />
}

// const mapLuxon2DateRange = ({ label, dateRange }: { label: string, dateRange: (null | DateTime)[] }) =>
//   ({ label, dateRange: [dateRange[0]?.toJSDate(), dateRange[1]?.toJSDate() ] })