import { MenuItem } from "@blueprintjs/core";
import { MultiSelect2 } from "@blueprintjs/select";
import React from "react";

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

export default class AreaMultiSelect extends React.PureComponent {
   
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
    const { items, selectedAreas, setSelectedAreas } = props;
      
    return (
      <MultiSelect2
        resetOnQuery={false}
        resetOnSelect={false}
        items={items}
        itemRenderer={this.renderItem}
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
