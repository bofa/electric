import React from 'react';
import axios from 'axios';
import { MenuItem2, Popover2 } from "@blueprintjs/popover2";
import {
  Navbar,
  NavbarDivider,
  NavbarGroup,
  Button,
  Menu,
  Icon,
} from "@blueprintjs/core";
import AreaMultiSelect from './AreaMultiSelect';
import App, { rangeOptions } from './App';
import './App.css';
import randomIcon from './icon-random';
import { DateTime } from 'luxon';
import predefinedList from './predefined';

const settingsIcon = randomIcon();

export default function TopBar() {
  const [options, setOptions] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [selectedAreas, setSelectedAreas] = React.useState(['SE3-Price', 'SE-Nuclear', 'SE-Load', 'SE-Import Balance']);
  const [selectDataSet, setSelectDataSet] = React.useState('priceDataSet');
  const [range, setRange] = React.useState(rangeOptions[6].key);
  const [preKey, setPreKey] = React.useState(null);
  const [merge, setMerge] = React.useState(false);
  
  const pre = predefinedList.find(p => p.key === preKey);

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
      setSelectDataSet(pre.selectDataSet);
      setSelectedAreas(pre.selectedAreas);
      setRange(pre.range);
      setMerge(pre.merge);
      setPreKey(null);
    }
  }, [pre]);

  return (
    <div className="App">
      <Navbar>
        <NavbarGroup>
          <Popover2 position="bottom" content={<Menu>
            <MenuItem2 text="Unit" icon="lightning">
              {options.map(({ key, name }) => <MenuItem2 onClick={() => setSelectDataSet(key)} roleStructure="listoption" selected={key === selectDataSet} key={key} text={name} />)}
            </MenuItem2>
            <MenuItem2 text="Range" icon="time">
              {rangeOptions.map(({ key }) => <MenuItem2 onClick={() => setRange(key)} roleStructure="listoption" selected={key === range} key={key} text={key} />)}
            </MenuItem2>
            <MenuItem2 text="Predefined" icon="settings">
              {predefinedList.map(({ key, text }) => <MenuItem2 onClick={() => setPreKey(key)} roleStructure="listoption" key={key} text={text} />)}
            </MenuItem2>
            <MenuItem2 text="Merge" icon="git-merge" labelElement={<Icon icon={merge ? "tick" : "disable"} minimal/>} onClick={() => setMerge(!merge)} />
          </Menu>}>
            <Button icon={settingsIcon}/>
          </Popover2>
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