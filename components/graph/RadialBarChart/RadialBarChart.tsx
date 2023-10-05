import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import GraphProps from '../../../modules/GraphProps/GraphProps';
import React from 'react';
import { useMediaQuery } from '@mui/material';
import searchQueryColors from '../../../modules/searchQueryColors/searchQueryColors';

/**
 * Creates a pre-configured ApexCharts radial bar graph component. Takes in `series` and `title` `GraphProps`. The `data` fields in `series` need to each be arrays with just one entry.
 * @param props
 * @returns radial bar graph
 */
export function RadialBarChart(props: GraphProps) {
  //make series accepted as normal { name: "", data: [num] } structure.
  //labels array will be created by taking the 'name' from every entry in series
  //series array will be created by taking the 'data' from every entry in series
  const compiledLabels = props.series.map((value) => value.name);
  const compiledSeries = props.series.map((value) => value.data);

  const options: ApexOptions = {
    chart: {
      id: 'bar',
      zoom: {
        enabled: false,
      },
      background: 'transparent',
    },
    labels: compiledLabels,
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
    plotOptions: {
      radialBar: {
        dataLabels: {
          show: true,
          total: {
            show: true,
            label: 'Average',
            color: '#000000',
          },
        },
      },
    },
    theme: {
      mode: useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light',
    },
  };

  return (
    <>
      <div className="h-full">
        <Chart
          options={options}
          series={compiledSeries}
          type="radialBar"
          width={'100%'}
        />
      </div>
    </>
  );
}
