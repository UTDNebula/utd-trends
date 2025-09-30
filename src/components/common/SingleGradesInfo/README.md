This component allows data from the Nebula API (grade distribution data for each search criteria) to be displayed as a graph. To show the graphs, Trends uses the GraphToggle component to toggle between the bar graph and line graph formats. It also shows some more data below the graph for each search: the total number of students who have taken the course/professor, the median gpa, and the mean gpa.

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

const barNode = (
  <div className="w-full h-64 flex items-center justify-center bg-slate-50">
    Bar chart placeholder
  </div>
);
const lineNode = (
  <div className="w-full h-64 flex items-center justify-center bg-slate-50">
    Line chart placeholder
  </div>
);
<>
  <GraphToggle state="ready" bar={barNode} line={lineNode} />
  <div className="flex flex-wrap justify-around">
    <p>
      Grades: <Skeleton className="inline-block w-[5ch]" />
    </p>
    <p>
      Median GPA: <Skeleton className="inline-block w-[5ch]" />
    </p>
    <p>
      Mean GPA: <Skeleton className="inline-block w-[5ch]" />
    </p>
  </div>
</>;
```
