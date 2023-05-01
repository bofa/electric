import {
  MenuItem,
  Menu,
  ButtonGroup,
  Button,
  MenuDivider,
  Tree,
  Radio,
  RadioGroup,
} from "@blueprintjs/core";
import { Popover2, MenuItem2, Classes as ClassesPop } from "@blueprintjs/popover2";
import { MultiSelect2 } from "@blueprintjs/select";
import React from "react";

const sortFunctions = [
  (a, b) => a.text.localeCompare(b.text),
  (a, b) => a.label - b.label,
]

export default class AreaMultiSelect extends React.PureComponent {
   
  state = {
    sort: 0, // TODO 'alphabetical' or 'numerical'?
    desc: 1,
    price: true,
    power: true,
    energy: true,
  }

  renderItem = (item, { handleClick, handleFocus, modifiers, query }) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }

    const active = this.props.selectedAreas.includes(item.area);

    return (
      <MenuItem
        {...modifiers}
        active={modifiers.active}
        disabled={modifiers.disabled}
        key={item.area}
        onClick={handleClick}
        onFocus={handleFocus}
        text={item.text}
        label={item.label}
        icon={active ? 'tick' : false}
      />
    );
  };

  render() {
    const props = this.props;
    const { selectedAreas, setSelectedAreas } = props;
    
    const { price, power, energy } = this.state;

    const sorter = (a, b) => this.state.desc * sortFunctions[this.state.sort];

    const items = props.items.sort(sorter);
    // const items = props.items.sort((a1, a2) => a1.text.localeCompare(a2.text));


    console.log('adsf', price, power, energy);
    return (
      <MultiSelect2
        resetOnQuery={false}
        resetOnSelect={false}
        items={items}
        itemRenderer={this.renderItem}
        itemListRenderer={({ items, itemsParentRef, query, renderItem }) =>
          <>
            <ButtonGroup minimal={true}>
              <Popover2 content={
                <Menu>
                  <CustomItem text="Price" selected={price} onClick={() => this.setState({ price: !price })}/>
                  <CustomItem text="Power" selected={power} onClick={() => this.setState({ power: !power })}/>
                  <CustomItem text="Energy" selected={energy} onClick={() => this.setState({ energy: !energy })}/>
                </Menu>
              }>
              <Button icon="lightning" onClick={() => setSelectedAreas([])}/>
              </Popover2>

              <Popover2 content={
                <Menu>
                  <CustomItem text="Geography" icon="globe" selected={price} onClick={() => this.setState({ price: !price })}/>
                  <CustomItem text="Source" icon="waves" selected={power} onClick={() => this.setState({ power: !power })}/>
                  <CustomItem text="Unit" icon="lightning" selected={power} onClick={() => this.setState({ power: !power })}/>
                </Menu>
              }>
                <Button icon="globe" onClick={() => this.setState({ sort: 1 })}/>
              </Popover2>

              <Popover2 popoverClassName={ClassesPop.POPOVER2_CONTENT_SIZING} content={
                <>
                  <RadioGroup
                    inline
                    onChange={e => this.setState({ sort: +e.target.value })}
                    selectedValue={this.state.sort}
                  >
                    <Radio label="Alphabetical" value={0} />
                    <Radio label="Numerical" value={1} />
                  </RadioGroup>

                  <RadioGroup
                    inline
                    onChange={e => this.setState({ desc: +e.target.value })}
                    selectedValue={this.state.desc}
                  >
                    <Radio label="Accending" value={1} />
                    <Radio label="Descending" value={-1} />
                  </RadioGroup>

                </>
              }>
                  <Button rightIcon="sort" onClick={() => this.setState({ sort: 0 })}/>
                </Popover2>
            </ButtonGroup>
            <MenuDivider/>
            <Tree
              contents={INITIAL_STATE.filter(n => n.label.includes())}
            />
            {/* {items.map(renderItem).filter(item => item != null)} */}
          </>
        }
        itemPredicate={(query, item) => matchQuery(query, item.area)}
        noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
        onItemSelect={item => setSelectedAreas(toggleItems(selectedAreas, item.area))}
        selectedItems={items.filter(item => selectedAreas.includes(item.area))}
        tagRenderer={item => item.area}
        onRemove={item => setSelectedAreas(toggleItems(selectedAreas, item.area))}
        tagInputProps={{
          inputProps: {
            autofill: 'off',
            type: 'search',
          }
        }}
      />
    );
  }
}

function toggleItems(selected, item) {
  if (selected.includes(item)) {
    return selected.filter(v => v !== item);
  } else {
    return selected.concat(item);
  }
}

function matchQuery(query, itemString) {
  const itemStringLower = itemString.toLowerCase();
  const querys = query.split(' ').map(q => q.toLowerCase())
  
  return querys.every(query => itemStringLower.includes(query));
}

const INITIAL_STATE = [
  {
    id: 0,
    hasCaret: true,
    isExpanded: true,
    label: "Sweden",
    childNodes: [
      {
        id: 12,
        label: "Nuclear",
      },
    ]
  },
  {
    id: 1,
    label: 'Norway',
    isExpanded: true,
    childNodes: [
      {
        id: 3,
        label: "Price",
      },
      {
        id: 2,
        label: "Power",
        isExpanded: true,
        childNodes: [
          {
            id: 1,
            label: 'Hydro',
          },
          {
            id: 2,
            label: 'Wind',
          }
        ]
      },
    ],
  },
];

const CustomItem = (props) => <MenuItem2 roleStructure='listoption' shouldDismissPopover={false} {...props}/> 