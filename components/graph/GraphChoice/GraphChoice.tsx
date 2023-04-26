import React from 'react';

import GraphProps from '../../../modules/GraphProps';
import { BarGraph } from '../BarGraph/BarGraph';
import { BoxGraph } from '../BoxGraph/BoxGraph';
import { HorizontalBarGraph } from '../HorizontalBarGraph/HorizontalBarGraph';
import { LineGraph } from '../LineGraph/LineGraph';
import { RadarChart } from '../RadarChart/RadarChart';
import { RadialBarChart } from '../RadialBarChart/RadialBarChart';
import { VerticalBarGraph } from '../VerticalBarGraph/VerticalBarGraph';

/**
 * This is a special graph component that creates the appropriate graph with it's corresponding props when given a graph type.
 */
export function GraphChoice(props: GraphProps) {
  switch (props.form) {
    case 'Bar': {
      return (
        <BarGraph
          xaxisLabels={props.xaxisLabels}
          yaxisFormatter={props.yaxisFormatter}
          series={props.series}
          title={props.title}
        ></BarGraph>
      );
    }
    case 'Line': {
      return (
        <LineGraph
          xaxisLabels={props.xaxisLabels}
          yaxisFormatter={props.yaxisFormatter}
          series={props.series}
          title={props.title}
        ></LineGraph>
      );
    }
    case 'BoxWhisker': {
      return (
        <BoxGraph
          xaxisLabels={props.xaxisLabels}
          yaxisFormatter={props.yaxisFormatter}
          series={props.series}
          title={props.title}
        ></BoxGraph>
      );
    }
    case 'Vertical': {
      return (
        <VerticalBarGraph
          xaxisLabels={props.xaxisLabels}
          yaxisFormatter={props.yaxisFormatter}
          series={props.series}
          title={props.title}
        ></VerticalBarGraph>
      );
    }
    case 'Horizontal': {
      return (
        <HorizontalBarGraph
          xaxisLabels={props.xaxisLabels}
          yaxisFormatter={props.yaxisFormatter}
          series={props.series}
          title={props.title}
        ></HorizontalBarGraph>
      );
    }
    case 'Radar': {
      return (
        <RadarChart
          xaxisLabels={props.xaxisLabels}
          series={props.series}
          title={props.title}
        ></RadarChart>
      );
    }
    case 'Radial': {
      return (
        <RadialBarChart
          series={props.series}
          title={props.title}
        ></RadialBarChart>
      );
    }
    default: {
      return (
        <BarGraph
          xaxisLabels={props.xaxisLabels}
          yaxisFormatter={props.yaxisFormatter}
          series={props.series}
          title={props.title}
        ></BarGraph>
      );
    }
  }
}
