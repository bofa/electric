export const regions = {
  id: 'all',
  name: 'All Regions',
  children: [
    {
      id: 'SE',
      name: 'Sweden',
      children: (['SE1', 'SE2', 'SE3', 'SE4'] as const).map(id => ({ id, children: [] }))
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
        ...(['QLD', 'SA', 'TAS', 'VIC'] as const).map(id => ({ id, children: [] }))
      ]
    },
  ],
} as const;

type TreeSearch<N> = N extends { id: string, children: any } ? N['id'] | TreeSearch<N['children'][number]> : never;
export type RegionId = TreeSearch<typeof regions>;