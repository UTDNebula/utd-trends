import { NextApiRequest, NextApiResponse } from 'next';

import comboTable from '../../data/combo_table.json';
import type SearchQuery from '../../modules/SearchQuery/SearchQuery';
import type { TableType } from '../../scripts/generateCombosTable';

type Data = {
  message: string;
  data?: SearchQuery[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if ('input' in req.query && typeof req.query.input === 'string') {
    res.status(200).json({
      message: 'success',
      data: (comboTable as TableType)[req.query.input],
    });
  } else {
    res.status(400).json({ message: 'Incorrect query parameters' });
  }
}
