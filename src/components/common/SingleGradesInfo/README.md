This component allows grade distribution data to be displayed as a graph. To show the graphs, Trends uses the GraphToggle component to toggle between the bar graph and line graph formats. It also shows some more data (right below the graph): the total number of students who have taken the course/professor, the median gpa, and the mean gpa.

### Props Table

| Prop          | Type                         | Description                                                                      | Required |
| :------------ | :--------------------------- | :------------------------------------------------------------------------------- | -------- |
| `title`       | `string`                     | The title of the graph (for ex. '# of Students')                                 | No       |
| `course`      | `SearchQuery`                | The query for which the data is retrieved (for ex. 'GOVT 2306' or 'Euel Elliot') | Yes      |
| `grades`      | `GenericFetchedData<Grades>` | Grade distribution data and relevant course information                          | Yes      |
| `gradesToUse` | `string`                     | Specifies if the grades used in the graph are filtered or unfiltered             | Yes      |

### SingleGradesInfo Example

```jsx
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
```
