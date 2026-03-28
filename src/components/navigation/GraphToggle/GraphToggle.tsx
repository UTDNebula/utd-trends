'use client';

import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import {
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import React, { useState } from 'react';

type Props = {
  state: string;
  bar?: React.ReactNode;
  line?: React.ReactNode;
};

/**
 *
 * This component displays either the `bar` or `line` node and provides a toggle to switch between a bar and line graph when viewing grade distributions.
 * If `state == 'loading'`, a Skeleton placeholder is rendered.
 */

export default function GraphToggle(props: Props) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');
  const isMobile = useMediaQuery('(max-width: 768px)');

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
    <div className={`w-full flex ${isMobile ? 'flex-col' : 'items-center'}`}>
      {/* Toggle Button to switch chart type - positioned at top on mobile */}
      {isMobile && (
        <div className="mb-4 flex justify-center">
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartToggle}
            size="small"
            orientation="horizontal"
            aria-label="chart type"
          >
            <Tooltip title="Bar Chart" placement="top">
              <ToggleButton value="bar" aria-label="bar chart">
                <BarChartIcon />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Line Chart" placement="top">
              <ToggleButton value="line" aria-label="line chart">
                <TimelineIcon />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </div>
      )}
      
      {/* Graphs */}
      <div className={isMobile ? 'w-full' : 'grow h-64'}>
        {chartType === 'bar' && props.bar}
        {chartType === 'line' && props.line}
      </div>
      
      {/* Toggle Button to switch chart type - positioned on right for desktop */}
      {!isMobile && (
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartToggle}
          size="small"
          orientation="vertical"
          aria-label="chart type"
        >
          <Tooltip title="Bar Chart" placement="top">
            <ToggleButton value="bar" aria-label="bar chart">
              <BarChartIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Line Chart" placement="bottom">
            <ToggleButton value="line" aria-label="line chart">
              <TimelineIcon />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      )}
    </div>
  );
}
