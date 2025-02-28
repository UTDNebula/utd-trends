import type { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useState } from 'react';

type Props = {
  state: string;
  bar?: ReactJSXElement;
  line?: ReactJSXElement;
};

function GraphToggle(props: Props) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');

  const handleChartToggle = (
    event: React.MouseEvent<HTMLElement>,
    newChartType: 'line' | 'bar',
  ) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  if (props.state === 'loading') {
    return <Skeleton variant="rounded" className="w-full h-64 m-2" />;
  }

  return (
    <div className="w-full flex items-center">
      {/* Graphs */}
      <div className="grow h-64">
        {chartType === 'bar' && props.bar}

        {chartType === 'line' && props.line}
      </div>
      {/* Toggle Button to switch chart type */}
      <ToggleButtonGroup
        value={chartType}
        exclusive
        onChange={handleChartToggle}
        size="small"
        orientation="vertical"
        aria-label="chart type"
      >
        <ToggleButton value="bar" aria-label="line chart">
          <BarChartIcon />
        </ToggleButton>
        <ToggleButton value="line" aria-label="bar chart">
          <TimelineIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}

export default GraphToggle;
