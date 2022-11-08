import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import GraphProps from '../../../modules/GraphProps';
import React from 'react';

/**
 * Creates a pre-configured ApexCharts vertical bar graph component. Takes in `series`, `title`, and `xaxisLabels` via `GraphProps`. This component also gets returned from a BarGraph component on a large screen.
 * @param props
 * @returns vertical bar graph
 */
export function VerticalBarGraph(props: GraphProps) {
  const options: ApexOptions = {
    chart: {
      id: 'line-chart',
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: true,
        tools: {
          customIcons: [{
            icon: '<div class="apexcharts-menu-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path transform="rotate(90)" d="m3-3h2 4v-2h-4v-4h-2v4 2zm0-12h2v-4h4v-2h-6v6zm12 12h4 2v-6h-2v4h-4v2zm0-16h4v4h2v-6h-2-4v2z" stroke-width="0"/></svg></div>',
            index: 0,
            title: 'Fullscreen',
            class: 'custom-icon',
            click: function (chart, options, e) {
			  console.log("fullscreen presses! chart info: ", chart, options, e);
            },
          }],
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: props.xaxisLabels,
    },
    yaxis: {
      labels: {
        formatter: props.yaxisFormatter,
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
