'use client';

import { FullscreenCloseIcon } from '@/components/icons/FullscreenCloseIcon/fullscreenCloseIcon';
import { FullscreenOpenIcon } from '@/components/icons/FullscreenOpenIcon/fullscreenOpenIcon';
import { compareColors, useRainbowColors } from '@/modules/colors';
import { Card, Fade, Modal, useMediaQuery } from '@mui/material';
import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

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
export default function BarGraph(props: Props) {
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
  const isMobile = useMediaQuery('(max-width: 768px)');

  // On mobile, height = 30px per bar group × number of categories
  const mobileHeight = (props.xaxisLabels?.length ?? 14) * series.length * 20 + 80;

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
        horizontal: isMobile,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: series.length !== 1,
      position: isMobile ? 'bottom' : 'top',
    },
    xaxis: {
      categories: props.xaxisLabels,
      labels: {
        formatter: isMobile ? props.yaxisFormatter : undefined,
      },
    },
    yaxis: {
      categories: props.xaxisLabels,
      labels: {
        formatter: isMobile ? undefined : props.yaxisFormatter,
      },
    },
    colors:
      series.length === 1
        ? rainbowColors
        : series.map((_, i) => {
            const includedIndices = props.includedColors
              ? props.includedColors
                  .map((inc, idx) => (inc ? idx : -1))
                  .filter((idx) => idx !== -1)
              : series.map((__, idx) => idx);
            return compareColors[
              (includedIndices[i] ?? i) % compareColors.length
            ];
          }),
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
    <div className={isMobile ? '' : 'h-full'}>
      <Chart
        options={options}
        series={series}
        type="bar"
        height={isMobile ? mobileHeight : '100%'}
      />
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
