import {
  MenuItem,
  Menu,
  ButtonGroup,
  Button,
  MenuDivider,
  Tree,
  Icon,
  Intent,
  Radio,
  RadioGroup,
  Classes
} from "@blueprintjs/core";
import { Tooltip2, ContextMenu2, Popover2, MenuItem2, Classes as ClassesPop } from "@blueprintjs/popover2";
import { MultiSelect2 } from "@blueprintjs/select";
import React from "react";

const sortFunctions = [
  (a1, a2) => a1.text.localeCompare(a2.text),
  (a1, a2) => a2.label - a1.label,
]

export default class AreaMultiSelect extends React.PureComponent {
   
  state = {
    sort: 0,
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

    const items = props.items.sort(sortFunctions[this.state.sort]);
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
                    label="Category"
                    onChange={this.handleMealChange}
                    selectedValue={this.state.mealType}
                  >
                    <Radio label="Alphabetical" value="one" />
                    <Radio label="Numerical" value="two" />
                  </RadioGroup>

                  <RadioGroup
                    inline
                    label="Order"
                    onChange={this.handleMealChange}
                    selectedValue={this.state.mealType}
                  >
                    <Radio label="Accending" value="one" />
                    <Radio label="Descending" value="two" />
                  </RadioGroup>

                </>
              }>
                  <Button rightIcon="sort" onClick={() => this.setState({ sort: 0 })}/>
                </Popover2>
            </ButtonGroup>
            <MenuDivider/>
            <Tree
              contents={INITIAL_STATE}
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
    icon: "folder-close",
    label: (
      <ContextMenu2 content={<div>Hello there!</div>}>
        Folder 0
      </ContextMenu2>
    ),
  },
  {
    id: 1,
    icon: "folder-close",
    isExpanded: true,
    label: (
      <ContextMenu2 content={<div>Hello there!</div>}>
        <Tooltip2 content="I'm a folder <3" placement="right">
          Folder 1
        </Tooltip2>
      </ContextMenu2>
    ),
    childNodes: [
      {
        id: 2,
        icon: "document",
        label: "Item 0",
        secondaryLabel: (
          <Tooltip2 content="An eye!">
            <Icon icon="eye-open" />
          </Tooltip2>
        ),
      },
      {
        id: 3,
        icon: <Icon icon="tag" intent={Intent.PRIMARY} className={Classes.TREE_NODE_ICON} />,
        label: "Organic meditation gluten-free, sriracha VHS drinking vinegar beard man.",
      },
      {
        id: 4,
        hasCaret: true,
        icon: "folder-close",
        label: (
          <ContextMenu2 content={<div>Hello there!</div>}>
            <Tooltip2 content="foo" placement="right">
              Folder 2
            </Tooltip2>
          </ContextMenu2>
        ),
        childNodes: [
          { id: 5, label: "No-Icon Item" },
          { id: 6, icon: "tag", label: "Item 1" },
          {
            id: 7,
            hasCaret: true,
            icon: "folder-close",
            label: (
              <ContextMenu2 content={<div>Hello there!</div>}>
                Folder 3
              </ContextMenu2>
            ),
            childNodes: [
              { id: 8, icon: "document", label: "Item 0" },
              { id: 9, icon: "tag", label: "Item 1" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    hasCaret: true,
    icon: "folder-close",
    label: "Super secret files",
    disabled: true,
  },
];

const CustomItem = (props) => <MenuItem2 roleStructure='listoption' shouldDismissPopover={false} {...props}/> 