'use client';

import { Card, Fade, Modal, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

import { FullscreenCloseIcon } from '@/components/icons/FullscreenCloseIcon/fullscreenCloseIcon';
import { FullscreenOpenIcon } from '@/components/icons/FullscreenOpenIcon/fullscreenOpenIcon';
import { compareColors } from '@/modules/colors';
import type { Grades } from '@/modules/fetchGrades';

function sortSemesters(a: string, b: string) {
  const rank = (code: string) => {
    let n = parseInt(code);
    if (code.includes('S')) n += 0.1;
    else if (code.includes('U')) n += 0.2;
    else n += 0.3;
    return n;
  };
  return rank(a) - rank(b);
}

function getSemesterGPAs(
  data: {
    name: string;
    data: Grades['grades'];
  },
  semesterMapping: Map<string, number>,
) {
  const allPoints: { x: number; y: number; semester: string }[] = [];

  data.data
    .toSorted((a, b) => sortSemesters(a._id, b._id))
    .forEach((semester) => {
      const total = semester.grade_distribution.reduce((a, c) => a + c, 0);
      const GPALookup = [
        4, 4, 3.67, 3.33, 3, 2.67, 2.33, 2, 1.67, 1.33, 1, 0.67, 0,
      ];

      let gpa = 0;
      if (total !== 0) {
        gpa =
          GPALookup.reduce(
            (acc, val, i) => acc + val * semester.grade_distribution[i],
            0,
          ) /
          (total -
            semester.grade_distribution[
              semester.grade_distribution.length - 1
            ]);
      }

      const xValue = semesterMapping.get(semester._id);
      if (xValue !== undefined) {
        allPoints.push({ x: xValue, y: gpa, semester: semester._id });
      }
    });

  return allPoints;
}

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Props = {
  title: string;
  series: {
    name: string;
    data: Grades['grades'];
  }[];
  includedColors?: boolean[];
};

export default function LineGraph(props: Props) {
  const [fullScreenOpen, setFullScreenOpen] = useState<boolean>(false);

  const icon =
    '<div class="apexcharts-menu-icon">' +
    (fullScreenOpen ? FullscreenCloseIcon : FullscreenOpenIcon) +
    '</div>';

  const allYearsSet = new Set<number>();
  props.series.forEach((s) =>
    s.data.forEach((sem) => allYearsSet.add(parseInt(sem._id))),
  );
  const allYears = Array.from(allYearsSet).sort((a, b) => a - b);

  const semesterMapping = new Map<string, number>();
  const categories: string[] = []; // only labels for Spring/Fall
  let idx = 0;

  allYears.forEach((year) => {
    const spring = `${year}S`;
    const summer = `${year}U`;
    const fall = `${year}F`;

    semesterMapping.set(spring, idx);
    categories.push(spring);

    semesterMapping.set(summer, idx + 0.5); // summer between spring & fall

    semesterMapping.set(fall, idx + 1);
    categories.push(fall);

    idx += 2;
  });

  const series = props.series.map((single) => ({
    name: single.name,
    data: getSemesterGPAs(single, semesterMapping).map((p) => ({
      x: p.x,
      y: p.y,
      semester: p.semester,
    })),
  }));

  const xValues = Array.from(semesterMapping.values());
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const tickAmount = Math.round(maxX - minX);

  const isInteger = (v: number) => Math.abs(v - Math.round(v)) < 1e-8;

  const theme = useTheme();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const options: ApexOptions = {
    chart: {
      type: 'line',
      zoom: { enabled: false },
      toolbar: {
        tools: {
          customIcons: [
            {
              icon,
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
        enabled: !fullScreenOpen && !series.every((s) => s.data.length === 1),
      },
    },
    grid: { borderColor: prefersDarkMode ? '#404040' : '#e0e0e0' },
    legend: { show: series.length !== 1 },
    xaxis: {
      type: 'numeric',
      min: minX,
      max: maxX,
      tickAmount,
      tickPlacement: 'on',
      labels: {
        rotate: -45,
        style: { fontSize: '12px' },
        formatter: (val) => {
          const n = Number(val);
          if (!isInteger(n)) return '';
          const idx = Math.round(n);
          return categories[idx] ?? '';
        },
      },
      axisTicks: { show: true },
    },
    yaxis: {
      min: 1,
      max: 4,
      labels: {
        formatter: (v) => (typeof v === 'number' ? v.toFixed(2) : ''),
      },
    },
    colors:
      series.length === 1
        ? [theme.vars.palette.primary.main]
        : compareColors.filter((_, i) => props.includedColors?.[i] ?? 1),
    stroke: { curve: 'straight', width: 5 },
    title: {
      text: props.title,
      align: 'left',
      style: { fontFamily: 'inherit' },
    },
    noData: {
      text: 'Please select a class to add',
      align: 'center',
      style: { fontSize: '14px', fontFamily: 'inherit' },
    },
    theme: { mode: prefersDarkMode ? 'dark' : 'light' },
    markers: { size: 4 },
    tooltip: {
      x: {
        formatter: (val, opts) => {
          const seriesIndex = opts?.seriesIndex;
          const dataPointIndex = opts?.dataPointIndex;
          if (seriesIndex != null && dataPointIndex != null) {
            const dataPoint = series[seriesIndex].data[dataPointIndex];
            return dataPoint?.semester ?? '';
          }
          return '';
        },
      },
    },
  };

  const graph = (
    <div className="h-full">
      <Chart options={options} series={series} type="line" height="100%" />
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
