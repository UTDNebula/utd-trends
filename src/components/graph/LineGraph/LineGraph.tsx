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
  semesterIndex: Map<string, number>,
) {
  const regular: { x: number; y: number }[] = [];
  const summer: { x: number; y: number }[] = [];

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

      const idx = semesterIndex.get(semester._id)!;
      const point = { x: idx, y: gpa };
      if (semester._id.includes('U')) summer.push(point);
      else regular.push(point);
    });

  return { regular, summer };
}

// Dynamically import react-apexcharts with SSR disabled.
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

  // Build full semester list dynamically
  const combined = Array.from(
    new Set(props.series.flatMap((s) => s.data.map((sem) => sem._id))),
  ).toSorted(sortSemesters);

  // Detect if any summer semesters exist in the raw data
  const hasSummer = combined.some((code) => code.includes('U'));

  const minYear = parseInt(combined[0]);
  const maxYear = parseInt(combined[combined.length - 1]);

  const allSemesters: string[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    allSemesters.push(`${y}S`);
    if (hasSummer) allSemesters.push(`${y}U`);
    allSemesters.push(`${y}F`);
  }

  const semesterIndex = new Map<string, number>();
  allSemesters.forEach((code, i) => semesterIndex.set(code, i));

  const series = props.series.flatMap((single) => {
    const { regular, summer } = getSemesterGPAs(single, semesterIndex);
    const arr = [{ name: single.name, data: regular }];
    if (summer.length > 0) {
      arr.push({ name: `${single.name} (Summer)`, data: summer });
    }
    return arr;
  });

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
      min: 0,
      max: allSemesters.length - 1,
      tickAmount: allSemesters.length - 1,
      labels: {
        formatter: (val: string | number) => {
          const idx = Math.round(Number(val));
          return allSemesters[idx] ?? '';
        },
        rotate: -45,
        style: { fontSize: '12px' },
      },
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
    stroke: {
      curve: 'straight',
      width: 5,
      dashArray: series.map((s) => (s.name.includes('(Summer)') ? 5 : 0)),
    },
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
        formatter: (val) => allSemesters[Math.round(val)] ?? '',
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
