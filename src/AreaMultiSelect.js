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
 
const renderItem = (item, { handleClick, handleFocus, modifiers, query }) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }

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
      icon={item.active ? 'tick' : false}
    />
  );
};
 
export default function FilmSelect(props) {
  const { selectedAreas, setSelectedAreas } = props;

  const items = props.areas
    .map(area => ({ area: area[0], text: area[0], label: Math.round(area[1]), active: selectedAreas.includes(area[0]) }))
    .sort((a1, a2) => a1.text.localeCompare(a2.text) )
  
  return (
    <MultiSelect2
      items={items}
      itemRenderer={renderItem}
      itemPredicate={(query, item) => item.area.toLowerCase().includes(query.toLowerCase())}
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
};