This component allows the display of the grades of a single course during a semester in a bar graph. You also have the ability to toggle this to a line graph.
The page will also display the total amount of grades, the median GPA, and the mean GPA.

### Props Table
| Prop         | Type                        | Description                                                                                    | Required |
| :----------- | :---------------------------| :----------------------------------------------------------------------------------------------| -------- |
|`title`       |`string`                     |The name of the class subject                                                                   | Yes      |
|`course`      |`SearchQuery`                |The official course code and number                                                             | Yes      |
|`grades`      |`GenericFetchedData<Grades>` |The total data of letter grades achieved by students in this class                              | Yes      |
|`gradesToUse` |`'filtered' \| 'unfiltered'` |The data of letter grades to use, possibly excluding certain terms (like summer or COVID terms) | Yes      |

### SingleGradesInfo Example
``` jsx
// import type { GenericFetchedData } from '@/types/GenericFetchedData';
import React from 'react';

import BarGraph from '@/components/graph/BarGraph/BarGraph';
import LineGraph from '@/components/graph/LineGraph/LineGraph';
import GraphToggle from '@/components/navigation/GraphToggle/GraphToggle';
import { Skeleton } from '@mui/material';

const sampleSeries = [
  {
    name: 'Sample Course',
    data: [],
  },
];
const barNode = (
  // <div className="w-full h-64 flex items-center justify-center bg-slate-50">
  //   Bar chart placeholder
  // </div>
  <BarGraph
    series={sampleSeries}
    xaxisLabels={[
      'A+',
      'A',
      'A-',
      'B+',
      'B',
      'B-',
      'C+',
      'C',
      'C-',
      'D+',
      'D',
      'D-',
      'F',
      'W',
    ]}
    title="# of Overall Students"
  ></BarGraph>
);
const lineNode = (
  <LineGraph title="GPA Trend" series={sampleSeries}></LineGraph>
);
<>
  <GraphToggle state="ready" bar={barNode} line={lineNode} />
  <div className="flex flex-wrap justify-around">
    <p>
      Grades: <b>0</b>
    </p>
    <p>
      Median GPA: <b>0</b>
    </p>
    <p>
      Mean GPA: <b>0</b>
    </p>
  </div>
</>;