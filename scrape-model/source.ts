import { Duration } from "luxon";

export const price = {
  id: 'Price',
  unit: 'EUR/MWh',
  children: [],
} as const;

export const power = {
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
} as const;

export const energy = {
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
} as const;

export const objectKeys = <Obj extends object>(obj: Obj): (keyof Obj)[] => {
  return Object.keys(obj) as (keyof Obj)[];
}

export const UNITS = {
  power: power.unit,
  price: price.unit,
  energy: energy.unit,
} as const;

export type ObjectValues<T> = T[keyof T];
export type Unit = ObjectValues<typeof UNITS>;

export interface NodeUnit extends Node { unit: Unit } 

export interface Node {
  id: string,
  name?: string,
  children: Node[],
};

type TreeSearch<N> = N extends { id: string, children: any } ? N['id'] | TreeSearch<N['children'][number]> : never;

export type PriceId = TreeSearch<typeof price>;
export type PowerId = TreeSearch<typeof power>;
export type EnergyId = TreeSearch<typeof energy>;