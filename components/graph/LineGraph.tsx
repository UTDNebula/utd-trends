import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import GraphProps from '../modules/GraphProps';

/**
 * Creates a pre-configured Apexcharts line graph component
 * @param props 
 * @returns line graph
 */
export function LineGraph(props: GraphProps) {
  const options: ApexOptions = {
    chart: {
      id: 'line-chart',
      zoom: {
        enabled: false,
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
    colors: ['#ffadad', '#9bf6ff', '#caffbf'],
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
          type="line"
          height={'100%'}
        />
      </div>
    </>
  );
}
