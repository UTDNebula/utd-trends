import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import GraphProps from '../../../modules/GraphProps';
import React from 'react';
import { useMediaQuery } from '@mui/material';

/**
 * Creates a pre-configured ApexCharts box-and-whisker graph. Takes in `series`, `title`, and `xaxisLabels` via `GraphProps`.
 * @param props
 * @returns line graph
 */
export function BoxGraph(props: GraphProps) {
  //This map() will create a new 'series' array "formattedSeries" that has x,y format instead of name,data format.
  //Contents are the same, this just changes the labels to match what Apex wants for a Boxplot.
  //This is done to preserve the name,data format being passed into all chart types.
  function quantile(arr: number[], q: number) {
    const sorted = [...arr].sort(function (a, b) {
      return a - b;
    });
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  }
  const formattedSeries = props.series.map((value) => {
    return {
      x: value.name,
      y: [
        value.data.reduce((a: number, b: number) => Math.min(a, b), Infinity),
        quantile(value.data, 0.25),
        quantile(value.data, 0.5),
        quantile(value.data, 0.75),
        value.data.reduce((a: number, b: number) => Math.max(a, b), -Infinity),
      ],
    };
  });
  const options: ApexOptions = {
    chart: {
      id: 'line-chart',
      zoom: {
        enabled: false,
      },
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
      boxPlot: {
        colors: {
          upper: '#eb5757',
          lower: '#2d9cdb',
        },
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
    theme: {
      mode: useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light',
    },
  };

  return (
    <>
      <div className="h-full">
        <Chart
          options={options}
          series={[
            {
              type: 'boxPlot',
              data: formattedSeries,
            },
          ]}
          type="boxPlot"
          height={'100%'}
        />
      </div>
    </>
  );
}
