import { useMediaQuery } from '@mui/material';
import { HorizontalBarGraph } from '../HorizontalBarGraph/HorizontalBarGraph';
import { VerticalBarGraph } from '../VerticalBarGraph/VerticalBarGraph';
import GraphProps from '../../../modules/GraphProps';
import React from 'react';

/**
 * The purpose of this component is to offer an automatically responsive bar chart feature
 * As the width of a screen gets smaller, it is more apt to make use of height so the
 * component returns a vertical bar graph instead of a horizontal bar graph.
 * @param props 
 * @returns bar graph component
 */
export function BarGraph(props: GraphProps) {
  const smallScreen = useMediaQuery('(min-width:600px)');
  if (smallScreen) {
    return (
      <VerticalBarGraph
        xaxisLabels={props.xaxisLabels}
        series={props.series}
        title={props.title}
      />
    );
  }
  return (
    <HorizontalBarGraph
      xaxisLabels={props.xaxisLabels}
      series={props.series}
      title={props.title}
    />
  );
}
