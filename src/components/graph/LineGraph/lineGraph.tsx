import { Skeleton } from '@mui/material';
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

type Props = {
  gpaTrend?: GenericFetchedData<GPATrendType>;
  chartTitle?: string;
  xAxisLabels?: string[];
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
  series?: {
    name: string;
    data: number[];
  }[];
};

function LineGraph({ gpaTrend, chartTitle, xAxisLabels, yAxisFormatter, tooltipFormatter, series }: Props): React.ReactNode {
  const [chartData, setChartData] = useState<{
    options: {
      chart: {
        id: string;
        animations: {
          enabled: boolean;
          easing: string;
          speed: number;
        };
        toolbar: {
          show: boolean;
        };
      };
      xaxis: {
        categories: string[];
        labels: {
          rotate: number;
        };
      };
      yaxis: {
        min: number;
        max: number;
        labels: {
          formatter: (value: number) => string;
        };
      };
      stroke: {
        curve: 'smooth';
      };
      markers: {
        size: number;
      };
      tooltip: {
        y: {
          formatter: (value: number) => string;
        };
      };
    };
    series: {
      name: string;
      data: number[];
    }[];
  }>({
    options: {
      chart: {
        id: 'gpa-trend',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: [],

        labels: {
          rotate: -45,
        },
      },
      yaxis: {
        min: 1,
        max: 4,
        labels: {
          formatter: (value: number) => value.toFixed(2),
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
          formatter: (value: number) => value.toFixed(3),
        },
      },
    },
    series: [
      {
        name: '',
        data: [],
      },
    ],
  });

  useEffect(() => {
    if (gpaTrend && gpaTrend.state === 'done') {
      setChartData(prev => ({
        options: {
          ...prev.options,

          xaxis: {
            categories: gpaTrend.data.season,
            labels: { rotate: -45 },
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
      setChartData(prev => ({
        options: {
          ...prev.options,

          xaxis: {
            categories: xAxisLabels || [],
            labels: { rotate: -45 },
          },

          yaxis: {
            ...prev.options.yaxis,
            labels: {
              formatter:
                yAxisFormatter || ((value: number) => value.toFixed(2)),
            },
          },

          tooltip: {
            y: {
              formatter:
                tooltipFormatter || ((value: number) => value.toFixed(3)),
            },
          },
        },

        series: series,
      }));
    }
  }, [gpaTrend, series, xAxisLabels, yAxisFormatter, tooltipFormatter]);

  if (gpaTrend) {
    if (gpaTrend.state === 'error') {
      return null;
    }
    if (gpaTrend.state === 'loading') {
      return (
        <div className="p-2">
          <Skeleton variant="rounded" className="w-full h-60 m-2" />
        </div>
      );
    }
  }
  const chartType = 'line'; // Define the chart type

  return (
    <div className="h-64">
      <Chart options={chartData.options} series={chartData.series} type={chartType} height={250} />
    </div>
  );
}

export default LineGraph;
