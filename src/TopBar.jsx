import React from 'react';
import axios from 'axios';
import { DateTime } from 'luxon';
import { MenuItem, Popover } from "@blueprintjs/core";
import {
  Navbar,
  NavbarDivider,
  NavbarGroup,
  ButtonGroup,
  Button,
  Menu,
  Icon,
  Classes as ClassesPop
} from "@blueprintjs/core";

import App from './App';
import AreaMultiSelect from './AreaMultiSelect';
// import AreaMultiSelect from './TreeMultiSelect';
import DateRangeSelect, { rangeShortcuts, minDate, maxDate } from './DateRangeSelect';
import './App.css';
import randomIcon from './icon-random';
import predefinedList from './predefined';
import { useWindowSize } from './utils/window';

const settingsIcon = randomIcon();

export default function TopBar() {
  const [options, setOptions] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [selectedAreas, setSelectedAreas] = React.useState(['SE3-Price', 'SE-Nuclear', 'SE-Load', 'SE-Import Balance']);
  const [selectDataSet, setSelectDataSet] = React.useState('priceDataSet');
  // const [range, setRange] = React.useState(rangeOptions[6].key);
  const [range, setRange] = React.useState([
    DateTime.now().minus({ year: 1 }),
    maxDate,
  ]);
  const [preKey, setPreKey] = React.useState(null);
  const [merge, setMerge] = React.useState(false);
  
  const pre = predefinedList.find(p => p.key === preKey);

  const size = useWindowSize();

  React.useEffect(() => {
    axios.get('https://raw.githubusercontent.com/bofa/electric/master/scrape/options-refactor.json')
      .then(response => response.data)
      .then(options => {
        setOptions(options);
      })
  }, [])

  React.useEffect(() => {
    const yearNow = DateTime.now().minus({ weeks: 4 }).year;
    const areas = options
      .find(option => option.key === selectDataSet)
      ?.files
      .map(file => file.options.map(o => ({
        ...o,
        year: Number(file.file.split('.')[0].split('-')[2])
      })))
      .flat()
      // TODO
      .filter(o => o.year === yearNow)
      || [];
  
    const items = areas
      .map(area => ({ area: area.key, text: area.key, label: Math.round(area.average) }))
      .sort((a1, a2) => a1.text.localeCompare(a2.text) )

    setItems(items);
  }, [options, selectDataSet])

  React.useEffect(() => {
    if (pre) {
      const rangeCut = rangeShortcuts
        .find(r => r.label === pre.range)
        ?.dateRange

      setSelectDataSet(pre.selectDataSet);
      setSelectedAreas(pre.selectedAreas);
      setRange(rangeCut || [minDate, maxDate]);
      setMerge(pre.merge);
      setPreKey(null);
    }
  }, [pre]);

  return (
    <div className="App">
      <Navbar>
        <NavbarGroup>
          <ButtonGroup>

            <Popover position="bottom" content={
              <Menu>
                <MenuItem text="Unit" icon="lightning">
                  {options.map(({ key, name }) => <MenuItem onClick={() => setSelectDataSet(key)} roleStructure="listoption" selected={key === selectDataSet} key={key} text={name} />)}
                </MenuItem>

                <MenuItem text="Predefined" icon="settings">
                  {predefinedList.map(({ key, text }) => <MenuItem onClick={() => setPreKey(key)} roleStructure="listoption" key={key} text={text} />)}
                </MenuItem>
                <MenuItem text="Merge" icon="git-merge" labelElement={<Icon icon={merge ? "tick" : "disable"} minimal/>} onClick={() => setMerge(!merge)} />
              </Menu>
            }>
              <Button icon={settingsIcon}/>
            </Popover>
            <DateRangeSelect
              value={range}
              onChange={range => setRange(range)}
            />
          </ButtonGroup>

          <NavbarDivider/>
          
          <AreaMultiSelect
            items={items}
            selectedAreas={selectedAreas}
            setSelectedAreas={setSelectedAreas}
          />
          {/* {loading && <Spinner style={{ marginLeft: 10 }} size={16}/>} */}
        </NavbarGroup>
      </Navbar>
      <App
        options={options}
        selectedAreas={selectedAreas}
        selectDataSet={selectDataSet}
        range={range}
        pre={pre}
        merge={merge}
      />
    </div>
  )
}