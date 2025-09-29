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
  const allPoints: { x: number; y: number }[] = [];

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
        allPoints.push({ x: xValue, y: gpa });
      }
    });

  return allPoints;
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

  // Get all unique semesters that actually have data
  const actualSemesters = Array.from(
    new Set(props.series.flatMap((s) => s.data.map((sem) => sem._id))),
  ).toSorted(sortSemesters);

  // Detect if any summer semesters exist in the raw data
  const summerSemestersWithData = new Set(
    actualSemesters.filter((code) => code.includes('U')),
  );

  const minYear = parseInt(actualSemesters[0]);
  const maxYear = parseInt(actualSemesters[actualSemesters.length - 1]);

  const allSemesterCodes: string[] = [];
  const labeledPositions = new Set<number>(); // Track which positions should have labels

  let position = 0;
  for (let y = minYear; y <= maxYear; y++) {
    // Spring
    const springCode = `${y}S`;
    allSemesterCodes.push(springCode);
    labeledPositions.add(position);
    position++;

    const summerCode = `${y}U`;
    if (summerSemestersWithData.has(summerCode)) {
      allSemesterCodes.push(summerCode);
      position++;
    }

    const fallCode = `${y}F`;
    allSemesterCodes.push(fallCode);
    labeledPositions.add(position);
    position++;
  }

  const semesterMapping = new Map<string, number>();
  allSemesterCodes.forEach((code, index) => {
    semesterMapping.set(code, index);
  });

  const series = props.series.map((single) => {
    const allPoints = getSemesterGPAs(single, semesterMapping);
    return { name: single.name, data: allPoints };
  });

  const allXValues = series.flatMap((s) => s.data.map((d) => d.x));
  const minX = allXValues.length > 0 ? Math.min(...allXValues) : 0;
  const maxX =
    allXValues.length > 0
      ? Math.max(...allXValues)
      : allSemesterCodes.length - 1;

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
      tickAmount: maxX - minX,
      tickPlacement: 'on',
      labels: {
        formatter: (val: string | number) => {
          const index = Math.round(Number(val));
          if (labeledPositions.has(index) && index < allSemesterCodes.length) {
            return allSemesterCodes[index];
          }
          return '';
        },
        rotate: -45,
        style: { fontSize: '12px' },
        hideOverlappingLabels: false,
      },
      axisTicks: {
        show: true,
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
        formatter: (val) => {
          const index = Math.round(val);
          if (index >= 0 && index < allSemesterCodes.length) {
            return allSemesterCodes[index];
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
