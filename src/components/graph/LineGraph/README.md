## LineGraph Component

The `LineGraph` component displays semester-wise GPA trends for one or more courses. It supports interactive markers, selectable semesters, and fullscreen mode. Dark/light themes are automatically detected.

---

### Props

| Prop             | Type                                         | Description                                                                                | Required |
| :--------------- | :------------------------------------------- | :----------------------------------------------------------------------------------------- | :------- |
| `title`          | `string`                                     | The title displayed above the chart.                                                       | Yes      |
| `series`         | `{ name: string; data: Grades['grades'] }[]` | The data series to display. Each `Grades['grades']` contains semester grade distributions. | Yes      |
| `includedColors` | `boolean[]`                                  | Optional array to filter which colors from the palette should be applied.                  | No       |

---

### Example Usage

```tsx
import { FiltersContext } from '@/app/dashboard/FilterContext';
import React from 'react';
import LineGraph from './LineGraph';

const data = [
  {
    name: 'Math 101',
    data: [
      {
        _id: '2023S',
        grade_distribution: [10, 5, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        _id: '2023F',
        grade_distribution: [8, 7, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    ],
  },
];

function ExampleLineGraph() {
  return (
    <FiltersContext.Provider
      value={{
        semesters: ['2023S', '2023F'],
        chosenSemesters: [],
        setChosenSemesters: () => {},
      }}
    >
      <LineGraph title="GPA Trend" series={data} />
    </FiltersContext.Provider>
  );
}

<ExampleLineGraph />;
```
