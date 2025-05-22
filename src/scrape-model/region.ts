export const REGIONS = {
  id: 'all',
  name: 'All Regions',
  children: [
    {
      id: 'SE',
      name: 'Sweden',
      children: [
        {
          id: 'SE1',
          children: [],
        },
        {
          id: 'SE2',
          children: [],
        },
        {
          id: 'SE3',
          children: [],
        },
        {
          id: 'SE4',
          children: [],
        },
      ]
    },
    {
      id: 'AUS',
      name: 'Australia',
      children: [
        {
          id: 'NSW',
          name: 'New South Wales',
          children: [],
        },
        // TODO
        // ...(['QLD', 'SA', 'TAS', 'VIC'] as const).map(id => ({ id, children: [] }))
      ]
    },
  ],
} as const;

type TreeSearch<N> = N extends { id: string, children: any } ? N['id'] | TreeSearch<N['children'][number]> : never;
export type RegionId = TreeSearch<typeof REGIONS>;