import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import GraphProps from '../../../modules/GraphProps/GraphProps';
import React from 'react';

/**
 * Creates a pre-configured ApexCharts horizontal bar graph component. Takes in `series`, `title`, and `xaxisLabels` via `GraphProps`. This component also gets returned from a BarGraph component on a small screen.
 * @param props
 * @returns horizontal bar graph
 */
export function HorizontalBarGraph(props: GraphProps) {
  function xaxisFormatter(value: string) {
    if (typeof props.yaxisFormatter === 'undefined') {
      return value;
    }
    return props.yaxisFormatter(Number(value));
  }

  const options: ApexOptions = {
    chart: {
      id: 'line-chart',
      zoom: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: props.xaxisLabels,
      labels: {
        formatter: xaxisFormatter,
      },
    },
    colors: ['#eb5757', '#2d9cdb', '#499F68'],
    stroke: {
      width: 2,
      curve: 'smooth',
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
          type="bar"
          height={'100%'}
        />
      </div>
    </>
  );
}
