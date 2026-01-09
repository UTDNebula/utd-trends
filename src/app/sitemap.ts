import untypedComboTable from '@/data/combo_table.json';
import { searchQueryLabel, type SearchQuery } from '@/types/SearchQuery';
import type { MetadataRoute } from 'next';

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
    ...Object.entries(comboTable).flatMap(([query, combos]) => {
      if (
        !combos.length ||
        (typeof combos[0].profFirst === 'undefined' &&
          typeof combos[0].profLast === 'undefined')
      ) {
        // Skip prof to course combos to avoid double counting
        return [];
      }
      return combos.map((combo) => ({
        url:
          'https://trends.utdnebula.com/dashboard?searchTerms=' +
          query.split(' ').join('+') +
          ',' +
          searchQueryLabel(combo).split(' ').join('+') +
          '&amp;availability=true',
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }));
    }),
    {
      url: 'https://trends.utdnebula.com/dashboard',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
