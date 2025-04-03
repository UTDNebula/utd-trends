import type { NextApiRequest, NextApiResponse } from 'next';

import comboTable from '@/data/combo_table.json';
import type { TableType } from '@/scripts/generateCombosTable';
import { type SearchQuery } from '@/types/SearchQuery';

type Data = {
  message: string;
  data?: SearchQuery[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const input = req.query.input;
  if (typeof input !== 'string') {
    res.status(400).json({ message: 'Incorrect query parameters' });
    return;
  }
  res.status(200).json({
    message: 'success',
    data: (comboTable as TableType)[input],
  });
}
