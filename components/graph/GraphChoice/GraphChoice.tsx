import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { BarGraph } from '../BarGraph/BarGraph';
import { LineGraph } from '../LineGraph/LineGraph';
import { RadarChart } from '../RadarChart/RadarChart';
import { RadialBarChart } from '../RadialBarChart/RadialBarChart';
import GraphProps from '../../../modules/GraphProps/GraphProps';
import { VerticalBarGraph } from '../VerticalBarGraph/VerticalBarGraph';
import { HorizontalBarGraph } from '../HorizontalBarGraph/HorizontalBarGraph';
import { BoxGraph } from '../BoxGraph/BoxGraph';
import React from 'react';

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
          subtitle={props.subtitle}
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
          subtitle={props.subtitle}
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
          subtitle={props.subtitle}
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
          subtitle={props.subtitle}
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
          subtitle={props.subtitle}
        ></HorizontalBarGraph>
      );
    }
    case 'Radar': {
      return (
        <RadarChart
          xaxisLabels={props.xaxisLabels}
          series={props.series}
          title={props.title}
          subtitle={props.subtitle}
        ></RadarChart>
      );
    }
    case 'Radial': {
      return (
        <RadialBarChart
          series={props.series}
          title={props.title}
          subtitle={props.subtitle}
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
          subtitle={props.subtitle}
        ></BarGraph>
      );
    }
  }
}
