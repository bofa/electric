import { Duration } from "luxon";



export const sources = [
  {
    id: 'Price',
    unit: 'EUR/MWh',
    children: [],
  },
  {
    id: 'Power',
    unit: 'MW',
    children: [
      {
        id: 'Load',
        children: [],
      },
      {
        id: 'Exports',
        children: [],
      },
      {
        id: 'Generation',
        children: [
          {
            id: 'Fossil',
            children: [
              {
                id: 'Gas',
                children: (['ccgt', 'ocgt'] as const).map(id => ({ id, children: [] }))
              },
              ...(['Coal'] as const).map(id => ({ id, children: [] }))
            ]
          },
          {
            id: 'Renewables',
            children: [
              {
                id: 'Solar',
                children: (['SolarUtility', 'SolarPrivate'] as const).map(id => ({ id, children: [] }))
              },
              ...(['Wind', 'Hydro'] as const).map(id => ({ id, children: [] }))
            ]
          }
        ],
      }
    ],
  },
  {
    unit: 'TWh',
    id: 'Energy',
    children: [
      {
        id: 'Hydro',
        children: [],
      },
      {
        id: 'Gas',
        children: [],
      }
    ],
  } 
] as const;

export const objectKeys = <Obj extends object>(obj: Obj): (keyof Obj)[] => {
  return Object.keys(obj) as (keyof Obj)[];
}

export const UNITS = {
  power: sources[0].unit,
  price: sources[1].unit,
  energy: sources[2].unit,
} as const;

export type ObjectValues<T> = T[keyof T];
export type Unit = ObjectValues<typeof UNITS>;

export interface Node {
  id: string,
  name?: string,
  children: Node[],
};

type TreeSearch<N> = N extends { id: string, children: any } ? N['id'] | TreeSearch<N['children'][number]> : never;

export type PriceId  = TreeSearch<typeof sources[0]>;
export type PowerId  = TreeSearch<typeof sources[1]>;
export type EnergyId = TreeSearch<typeof sources[2]>;