'use client';

import { Card, Fade, Modal, useMediaQuery } from '@mui/material';
import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

import { FullscreenCloseIcon } from '@/components/icons/FullscreenCloseIcon/fullscreenCloseIcon';
import { FullscreenOpenIcon } from '@/components/icons/FullscreenOpenIcon/fullscreenOpenIcon';
import { compareColors, useRainbowColors } from '@/modules/colors';

// Dynamically import react-apexcharts with SSR disabled.
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Props = {
  xaxisLabels?: string[];
  yaxisFormatter?: (val: number) => string;
  tooltipFormatter?: (
    val: number,
    extra: { series: number[]; seriesIndex: number; dataPointIndex: number },
  ) => string;
  series: {
    name: string;
    data: number[];
  }[];
  title: string;
  labels?: string[];
  includedColors?: boolean[];
};

/**
 * Creates a pre-configured ApexCharts vertical bar graph component. Takes in `series`, `title`, and `xaxisLabels` via `GraphProps`. This component also gets returned from a BarGraph component on a large screen.
 * @param props
 * @returns vertical bar graph
 */
function BarGraph(props: Props) {
  const [fullScreenOpen, setFullScreenOpen] = useState<boolean>(false);

  const icon =
    '<div class="apexcharts-menu-icon">' +
    (fullScreenOpen ? FullscreenCloseIcon : FullscreenOpenIcon) +
    '</div>';

  let series = props.series;
  let noDataText = 'Please select a class to add';
  if (
    series.length !== 0 &&
    series.every((grade_distribution) =>
      grade_distribution.data.every((letter: number) => isNaN(letter)),
    )
  ) {
    series = [];
    noDataText = 'Grade data unavailable for selected courses';
  }

  const rainbowColors = useRainbowColors();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const options: ApexOptions = {
    chart: {
      zoom: {
        enabled: false,
      },
      toolbar: {
        tools: {
          customIcons: [
            {
              icon: icon,
              index: 0,
              title: 'Fullscreen',
              class: 'custom-icon',
              click: () => setFullScreenOpen(!fullScreenOpen),
            },
          ],
        },
      },
      background: 'transparent',
      animations: {
        enabled: !fullScreenOpen,
      },
    },
    grid: {
      borderColor: prefersDarkMode ? '#404040' : '#e0e0e0',
    },
    plotOptions: {
      bar: {
        distributed: series.length === 1,
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: series.length !== 1,
    },
    xaxis: {
      categories: props.xaxisLabels,
    },
    yaxis: {
      labels: {
        formatter: props.yaxisFormatter,
      },
    },
    colors:
      series.length === 1
        ? rainbowColors
        : compareColors.filter(
            (searchQuery, i) => props.includedColors?.[i] ?? 1,
          ),
    stroke: {
      width: 2,
    },
    title: {
      text: props.title,
      align: 'left',
      style: {
        fontFamily: 'inherit',
      },
    },
    noData: {
      text: noDataText,
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 0,
      offsetY: 0,
      style: {
        fontSize: '14px',
        fontFamily: 'inherit',
      },
    },
    theme: {
      mode: prefersDarkMode ? 'dark' : 'light',
    },
    tooltip: {
      y: {
        formatter: props.tooltipFormatter ?? props.yaxisFormatter,
      },
    },
    states: {
      active: {
        filter: {
          type: 'none',
        },
      },
    },
  };

  const graph = (
    <div className="h-full">
      <Chart options={options} series={series} type="bar" height={'100%'} />
    </div>
  );

  return (
    <>
      {graph}
      <Modal
        open={fullScreenOpen}
        onClose={() => setFullScreenOpen(false)}
        className="flex justify-stretch align-stretch"
      >
        <Fade in={fullScreenOpen}>
          <Card className="p-4 m-12 flex-auto">{graph}</Card>
        </Fade>
      </Modal>
    </>
  );
}

export default BarGraph;
