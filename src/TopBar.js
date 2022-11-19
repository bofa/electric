import React from 'react';
import axios from 'axios';
import { MenuItem2, Popover2 } from "@blueprintjs/popover2";
import {
  Navbar,
  NavbarDivider,
  NavbarGroup,
  Button,
  Menu,
} from "@blueprintjs/core";
import AreaMultiSelect from './AreaMultiSelect';
import App, { rangeOptions } from './App';
import './App.css';
import randomIcon from './icon-random';

const settingsIcon = randomIcon();

export default function TopBar() {
  const [options, setOptions] = React.useState([]);
  const [selectedAreas, setSelectedAreas] = React.useState(['SE3-Price', 'SE-Nuclear', 'SE-Load', 'SE-Import Balance']);
  const [selectDataSet, setSelectDataSet] = React.useState('priceDataSet');
  const [range, setRange] = React.useState(rangeOptions[1].key);
  
  React.useEffect(() => {
    axios.get('https://raw.githubusercontent.com/bofa/electric/master/scrape/options-refactor.json')
      .then(response => response.data)
      .then(setOptions)
  }, [])

  return (
    <div className="App">
      <Navbar>
        <NavbarGroup>
          <Popover2 content={<Menu>
            <MenuItem2 text="Type">
              {options.map(({ key, name }) => <MenuItem2 onClick={() => setSelectDataSet(key)} roleStructure="listoption" selected={key === selectDataSet} key={key} text={name} />)}
            </MenuItem2>
            <MenuItem2 text="Range">
              {rangeOptions.map(({ key }) => <MenuItem2 onClick={() => setRange(key)} roleStructure="listoption" selected={key === range}  key={key} text={key} />)}
            </MenuItem2>
          </Menu>}>
            <Button icon={settingsIcon} />
          </Popover2>
          <NavbarDivider/>
          <AreaMultiSelect
            options={options}
            // areas={areasArray}
            selectedAreas={selectedAreas}
            setSelectedAreas={setSelectedAreas}
            selectDataSet={selectDataSet}
          />
          {/* {loading && <Spinner style={{ marginLeft: 10 }} size={16}/>} */}
        </NavbarGroup>
      </Navbar>
      <App
        selectedAreas={selectedAreas}
        selectDataSet={selectDataSet}
        range={range}
      />
    </div>
  )
}