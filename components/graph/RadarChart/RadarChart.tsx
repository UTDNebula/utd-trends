import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import React from 'react';

import GraphProps from '../../../modules/GraphProps';
import searchQueryColors from '../../../modules/searchQueryColors/searchQueryColors';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

/**
 * Creates a pre-configured ApexCharts radar graph component. Takes in `series`, `title`, and `xaxisLabels` via `GraphProps`.
 * @param props
 * @returns horizontal bar graph
 */
export function RadarChart(props: GraphProps) {
  const options: ApexOptions = {
    chart: {
      id: 'radar',
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: props.xaxisLabels,
    },
    colors: searchQueryColors,
    stroke: {
      width: 2,
    },
    title: {
      text: props.title,
      align: 'left',
    },
    noData: {
      text: 'Please select a class to add',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 0,
      offsetY: 0,
      style: {
        color: undefined,
        fontSize: '14px',
        fontFamily: undefined,
      },
    },
  };

  return (
    <>
      <div className="h-full">
        <Chart
          options={options}
          series={props.series}
          type="radar"
          height={'100%'}
        />
      </div>
    </>
  );
}
