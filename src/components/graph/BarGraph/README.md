## BarGraph Component

The `BarGraph` component renders vertical bar graphs using ApexCharts. It supports multiple series, custom colors, fullscreen mode, tooltips, and dark/light theme detection.  

---

### Props

| Prop               | Type | Description | Required |
|-------------------|------|------------|---------|
| `series`           | `{ name: string; data: number[] }[]` | Array of data series to display. Each series contains a `name` and array of numbers. | Yes |
| `title`            | `string` | The title displayed above the chart. | Yes |
| `xaxisLabels`      | `string[]` | Labels for the x-axis categories. | No |
| `labels`           | `string[]` | Optional labels for each bar. | No |
| `yaxisFormatter`   | `(val: number) => string` | Optional formatter for y-axis labels. | No |
| `tooltipFormatter` | `(val: number, extra: { series: number[]; seriesIndex: number; dataPointIndex: number }) => string` | Optional formatter for tooltip values. | No |
| `includedColors`   | `boolean[]` | Optional array to filter which colors from the palette should be applied. | No |


### Example Usage

```tsx
'use client';

import React from 'react';
import BarGraph from './BarGraph';

export default function ExampleBarGraph() {
  const data = [
    { name: 'Math 101', data: [85, 90, 75, 60] },
    { name: 'History 201', data: [70, 88, 92, 80] },
  ];

  const xLabels = ['Q1', 'Q2', 'Q3', 'Q4'];

  return (
    <BarGraph
      title="Course Grades"
      series={data}
      xaxisLabels={xLabels}
      yaxisFormatter={(val) => `${val}%`}
      tooltipFormatter={(val) => `Score: ${val}%`}
    />
  );
}
