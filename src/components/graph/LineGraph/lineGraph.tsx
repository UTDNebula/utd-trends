import { Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

import {
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { GenericFetchedData } from '@/pages/dashboard/index';

export type GPATrendType = {
  season: string[];
  years: string[];
  gpa: number[];
};

type Props = {
  recentSemesters: SearchQuery;
  gpaTrend: GenericFetchedData<GPATrendType>;
};

function LineGraph({ recentSemesters, gpaTrend }: Props) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
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
        categories: [] as string[],
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
    if (gpaTrend.state === 'done') {
      setChartData({
        options: {
          ...chartData.options,
          xaxis: {
            categories: gpaTrend.data.season,
            labels: { rotate: -45 },
          },
        },
        series: [
          {
            name: searchQueryLabel(recentSemesters),
            data: gpaTrend.data.gpa,
          },
        ],
      });
    }
  }, [gpaTrend, recentSemesters]);

  const handleChartToggle = (
    _event: React.MouseEvent<HTMLElement>,
    newChartType: 'line' | 'bar' | null,
  ) => {
    if (newChartType) {
      setChartType(newChartType);
    }
  };

  if (typeof gpaTrend === 'undefined' || gpaTrend.state === 'error') {
    return null;
  }
  if (gpaTrend.state === 'loading') {
    return (
      <div className="p-2">
        <Skeleton variant="rounded" className="w-full h-60 m-2" />
      </div>
    );
  }

  return (
    <div className="p-2">
      <ToggleButtonGroup
        value={chartType}
        exclusive
        onChange={handleChartToggle}
        className="mb-2"
      >
        <ToggleButton value="bar"></ToggleButton>
        <ToggleButton value="line"></ToggleButton>
      </ToggleButtonGroup>
      <div className="h-64">
        <Chart
          options={chartData.options}
          series={chartData.series}
          type={chartType}
          height={250}
        />
      </div>
    </div>
  );
}

export default LineGraph;
