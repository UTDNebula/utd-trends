import { Skeleton } from '@mui/material';
import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';

import type { GenericFetchedData } from '@/pages/dashboard/index';

// Dynamically import react-apexcharts with SSR disabled.
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export type GPATrendType = {
  season: string[];
  years: string[];
  gpa: number[];
};

type SeriesType = {
  name: string;
  data: number[];
};

type Props = {
  gpaTrend?: GenericFetchedData<GPATrendType>;
  chartTitle?: string;
  xAxisLabels?: string[];
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
  series?: SeriesType[];
  height?: number;
};

const LineGraph = ({
  gpaTrend,
  chartTitle,
  xAxisLabels,
  yAxisFormatter,
  tooltipFormatter,
  series,
  height = 250,
}: Props): JSX.Element => {
  const [chartData, setChartData] = useState<{
    options: ApexOptions;
    series: SeriesType[];
  }>({
    options: {
      chart: {
        id: 'gpa-trend',
        animations: {
          enabled: true,
          speed: 800,
        },
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: true,
        },
      },
      xaxis: {
        categories: xAxisLabels || [],
        labels: {
          rotate: -45,
        },
        title: {
          text: 'Semester',
          style: {
            fontSize: '12px',
            fontWeight: '600',
          },
        },
      },
      yaxis: {
        min: 1,
        max: 4,
        title: {
          text: 'GPA',
          style: {
            fontSize: '12px',
            fontWeight: '600',
          },
        },
        labels: {
          formatter: (value: number) =>
            yAxisFormatter ? yAxisFormatter(value) : value.toFixed(2),
        },
      },
      stroke: {
        curve: 'smooth',
      },
      markers: {
        size: 5,
      },
      tooltip: {
        y: {
          formatter: (value: number) =>
            tooltipFormatter ? tooltipFormatter(value) : value.toFixed(3),
        },
        theme: 'dark',
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
    },
    series: series || [
      {
        name: chartTitle || '',
        data: [],
      },
    ],
  });

  useEffect(() => {
    if (gpaTrend && gpaTrend.state === 'done') {
      setChartData((prev) => ({
        ...prev,
        options: {
          ...prev.options,
          xaxis: {
            ...prev.options.xaxis,
            categories: gpaTrend.data.season,
          },
        },
        series: [
          {
            name: chartTitle || '',
            data: gpaTrend.data.gpa,
          },
        ],
      }));
    } else if (series) {
      setChartData((prev) => ({
        ...prev,
        series: series,
      }));
    }
  }, [gpaTrend, series, chartTitle]);

  if (gpaTrend && gpaTrend.state === 'loading') {
    return <Skeleton variant="rounded" height={height} />;
  }

  return (
    <div>
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="line"
        height={height}
      />
    </div>
  );
};

export default LineGraph;
