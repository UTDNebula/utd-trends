/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import LineGraph from '@/components/graph/LineGraph/LineGraph';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

type MockChartProps = {
  options: {
    xaxis: { labels: { formatter: (val: string) => string } };
  };
  series: { data: { x: number; semester: string }[] }[];
};

// ApexCharts needs a real browser, so render what LineGraph hands it instead
jest.mock('next/dynamic', () => () => {
  const MockChart = (props: MockChartProps) => {
    const points = props.series.flatMap((s) => s.data);
    return (
      <div data-testid="chart">
        {points.map((p) => `${p.semester}@${p.x}`).join(',')}|
        {props.options.xaxis.labels.formatter('0')}
      </div>
    );
  };
  return MockChart;
});

const oneSemester = [
  {
    _id: '24F',
    data: [
      {
        type: '0xx',
        grade_distribution: [5, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    ],
  },
];

// A semester with only W/P/NP-style counts has no letter grades, so it adds
// no point to the graph
const noLetterGrades = [
  {
    _id: '23S',
    data: [
      {
        type: '0xx',
        grade_distribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
      },
    ],
  },
];

const theme = createTheme({ cssVariables: true });
const renderWithTheme = (ui: ReactNode) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('LineGraph', () => {
  it('renders a single point that is not in the first series', () => {
    renderWithTheme(
      <LineGraph
        title="Grades"
        series={[
          { name: 'Overall', data: noLetterGrades },
          { name: 'Prajakti Akarte', data: oneSemester },
        ]}
      />,
    );

    expect(screen.getByTestId('chart')).toHaveTextContent('24F@0.5|24F');
  });

  it('renders a single point in the first series', () => {
    renderWithTheme(
      <LineGraph
        title="Grades"
        series={[{ name: 'Prajakti Akarte', data: oneSemester }]}
      />,
    );

    expect(screen.getByTestId('chart')).toHaveTextContent('24F@0.5|24F');
  });
});
