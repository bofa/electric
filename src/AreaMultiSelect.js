import { Button, MenuItem, Tag } from "@blueprintjs/core";
import { MultiSelect2 } from "@blueprintjs/select";
import React from "react";
 
// export interface Film {
//     title: string;
//     year: number;
//     rank: number;
// }
 
// const TOP_100_FILMS: Film[] = [
//     { title: "The Shawshank Redemption", year: 1994 },
//     { title: "The Godfather", year: 1972 },
//     // ...
// ].map((f, index) => ({ ...f, rank: index + 1 }));
 
// const filterFilm: ItemPredicate<Film> = (query, film, _index, exactMatch) => {
//     const normalizedTitle = film.title.toLowerCase();
//     const normalizedQuery = query.toLowerCase();
 
//     if (exactMatch) {
//         return normalizedTitle === normalizedQuery;
//     } else {
//         return `${film.rank}. ${normalizedTitle} ${film.year}`.indexOf(normalizedQuery) >= 0;
//     }
// };
 
const renderItem = (item, { handleClick, handleFocus, modifiers, query }) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }

  console.log('Render');

  return (
    <MenuItem
      // active={modifiers.active}
      // disabled={modifiers.disabled}
      key={item.area}
      // label={item.area}
      // onClick={handleClick}
      // onFocus={handleFocus}
      text={item.text}
    />
  );
};
 
export default function FilmSelect(props) {
  const [selectedAreas, setSelectedAreas] = React.useState([]);
  const items = props.areas.map(area => ({ area, text: area }));

  return (
    <MultiSelect2
      items={items}
      // itemPredicate={filterFilm}
      itemRenderer={renderItem}
      noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
      onItemSelect={item => setSelectedAreas([item.area])}
      selectedItems={selectedAreas}
      tagRenderer={item => <Tag>{item.area}</Tag>}
    />
  );
};