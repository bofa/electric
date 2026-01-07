import {
  MenuItem,
  Menu,
  ButtonGroup,
  Button,
  MenuDivider,
  Tree,
  Radio,
  RadioGroup,
  TreeNodeInfo,
} from "@blueprintjs/core";
import { Popover2, MenuItem2, Classes as ClassesPop, MenuItem2Props } from "@blueprintjs/popover2";
import { ItemRendererProps, MultiSelect2 } from "@blueprintjs/select";
import React from "react";
import { Series } from "./scrape-model/series";
import { REGIONS } from "./scrape-model/region";

type Item = {
  area: string,
  text: string,
  label: number,
}

type Node = Omit<TreeNodeInfo, 'id'> & { id: string }

type Props = {
  series: Series[],
  selectedAreas: any[],
  setSelectedAreas: (areas: any[]) => void,
}

type State = typeof initState;

const initState = {
  sort: 0, // TODO 'alphabetical' or 'numerical'?
  desc: 1,
  price: true,
  power: true,
  energy: true,
};

export default class AreaMultiSelect extends React.Component<Props, State> {
   
  state = initState

  renderItem = (item: TreeNodeInfo, { handleClick, handleFocus, modifiers, query }: ItemRendererProps) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }

    const active = this.props.selectedAreas.includes(item.id);

    return (
      <MenuItem
        {...modifiers}
        active={modifiers.active}
        disabled={modifiers.disabled}
        key={item.id}
        onClick={handleClick}
        onFocus={handleFocus}
        text={item.label}
        label={'' + item.label}
        icon={active ? 'tick' : false}
      />
    );
  };

  render() {
    const props = this.props;
    const { selectedAreas, setSelectedAreas } = props;
    
    const { price, power, energy } = this.state;

    const sorter = (a: any, b: any) => this.state.desc * sortFunctions[this.state.sort](a, b);

    // const items = props.series
    //   // TODO
    //   // .sort(sorter)
    //   .map(s => ({
    //     id: s.id,
    //     label: [s.region, s.type, s.unit].join('-'),
    //     isSelected: selectedAreas.includes(s.id),
    //   }));

    // const items = props.items.sort((a1, a2) => a1.text.localeCompare(a2.text));

    const items: Node[] = REGIONS.children.map(r => ({
      id: r.id,
      label: r.name,
    }))

    return (
      <MultiSelect2<Node>
        resetOnQuery={false}
        resetOnSelect={false}
        items={items}
        itemRenderer={this.renderItem}
        itemListRenderer={({ items, itemsParentRef, query, renderItem }) => (
          <>
            <ButtonGroup minimal>
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
                <Button icon="globe"/>
              </Popover2>

              <Popover2 popoverClassName={ClassesPop.POPOVER2_CONTENT_SIZING} content={
                <>
                  <RadioGroup
                    inline
                    onChange={(e: any) => this.setState({ sort: +e.target.value })}
                    selectedValue={this.state.sort}
                  >
                    <Radio label="Alphabetical" value={0} />
                    <Radio label="Numerical" value={1} />
                  </RadioGroup>

                  <RadioGroup
                    inline
                    onChange={(e: any) => this.setState({ desc: +e.target.value })}
                    selectedValue={this.state.desc}
                  >
                    <Radio label="Accending" value={1} />
                    <Radio label="Descending" value={-1} />
                  </RadioGroup>

                </>
              }>
                <Button rightIcon="sort"/>
              </Popover2>
            </ButtonGroup>
            <MenuDivider/>
            <Tree
              contents={items.filter((item) => matchQuery(query, item.id))}
              onNodeClick={node => setSelectedAreas(toggleItems(selectedAreas, node.id as string))}
            />
          </>
        )}
        itemPredicate={(query, item) => matchQuery(query, item.id)}
        noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
        onItemSelect={item => setSelectedAreas(toggleItems(selectedAreas, item.id))}
        selectedItems={items.filter(item => selectedAreas.includes(item.id))}
        tagRenderer={item => item.id}
        onRemove={item => setSelectedAreas(toggleItems(selectedAreas, item.id))}
        tagInputProps={{
          inputProps: {
            type: 'search',
          }
        }}
      />
    );
  }
}

const sortFunctions = [
  (a: { text: string; }, b: { text: any; }) => a.text.localeCompare(b.text),
  (a: { label: number; }, b: { label: number; }) => a.label - b.label,
]

function toggleItems(selected: any[], item: string) {
  if (selected.includes(item)) {
    return selected.filter(v => v !== item);
  } else {
    return selected.concat(item);
  }
}

function matchQuery(query: string, itemString: string) {
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

const CustomItem = (props: MenuItem2Props) => <MenuItem2 roleStructure='listoption' shouldDismissPopover={false} {...props}/> 
