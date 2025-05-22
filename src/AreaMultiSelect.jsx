import { MenuItem, Menu, ButtonGroup, Button, MenuDivider, Label } from "@blueprintjs/core";
import { MultiSelect2 } from "@blueprintjs/select";
import React from "react";

const sortFunctions = [
  (a1, a2) => a1.text.localeCompare(a2.text),
  (a1, a2) => a2.label - a1.label,
]

export default class AreaMultiSelect extends React.PureComponent {
   
  state = {
    sort: 0,
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
      
    const items = props.items.sort(sortFunctions[this.state.sort]);
    // const items = props.items.sort((a1, a2) => a1.text.localeCompare(a2.text));

    return (
      <MultiSelect2
        resetOnQuery={false}
        resetOnSelect={false}
        items={items}
        itemRenderer={this.renderItem}
        itemListRenderer={({ items, itemsParentRef, query, renderItem }) => 
          <>
            <ButtonGroup minimal={true}>
              <Button rightIcon="sort-alphabetical" onClick={() => this.setState({ sort: 0 })}>
                Sort
              </Button>
              <Button icon="sort-numerical-desc" onClick={() => this.setState({ sort: 1 })}/>
              <Button icon="eraser" onClick={() => setSelectedAreas([])}/>
            </ButtonGroup>
            <Menu ulRef={itemsParentRef}>
              <MenuDivider/>
              {items.map(renderItem).filter(item => item != null)}
            </Menu>
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