import type { MetadataRoute } from 'next';

import untypedComboTable from '@/data/combo_table.json';
import type { SearchQuery } from '@/types/SearchQuery';

const comboTable = untypedComboTable as { [key: string]: SearchQuery[] };

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://trends.utdnebula.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://trends.utdnebula.com/planner',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...Object.keys(comboTable).map((query) => ({
      url:
        'https://trends.utdnebula.com/dashboard?searchTerms=' +
        query.split(' ').join('+') +
        '&amp;availability=true',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    {
      url: 'https://trends.utdnebula.com/dashboard',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
