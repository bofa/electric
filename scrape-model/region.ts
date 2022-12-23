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

export type RegionId = typeof regions['id']
  | typeof regions['children'][number]['id']
  | typeof regions['children'][number]['children'][number]['id']
  | typeof regions['children'][number]['children'][number]['children'][number]['id'];