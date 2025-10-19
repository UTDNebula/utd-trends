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
import { displaySemesterName } from '@/modules/semesters';

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
  data: { name: string; data: Grades['grades'] },
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
  series: { name: string; data: Grades['grades'] }[];
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

  const theme = useTheme();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const multiplePoints = series.reduce((acc, s) => acc + s.data.length, 0) > 1;
  const isInteger = (v: number) => Math.abs(v - Math.round(v)) < 1e-8;

  // Compute min/max of data points (integer indices)
  const dataIndices = series.flatMap((s) => s.data.map((p) => Math.round(p.x)));
  const hasData = dataIndices.length > 0;
  const allIndicesWithData = series.flatMap((s) => s.data.map((p) => p.x));
  const firstIdxWithData = Math.min(...allIndicesWithData);
  const lastIdxWithData = Math.max(...allIndicesWithData);
  let customMin = 0;
  let customMax = 0;
  let customCategories = [...categories];
  let singleLabelMode = false;
  let tickAmount = multiplePoints ? undefined : 0;

  if (!multiplePoints && hasData) {
    singleLabelMode = true;
    const point = series[0].data[0];
    const sem = point.semester;

    point.x = 0.5;
    customMin = 0;
    customMax = 1;

    if (sem.includes('U')) {
      const year = sem.slice(0, -1);
      customCategories = [`${year}S`, `${year}F`];
      tickAmount = 2;
    } else {
      customCategories = [sem];
      tickAmount = 0;
    }
  } else if (multiplePoints && hasData) {
    customMin = Math.floor(firstIdxWithData);
    customMax = Math.ceil(lastIdxWithData);

    if (
      isInteger(lastIdxWithData) != isInteger(firstIdxWithData)
    ) {
      if (isInteger(firstIdxWithData)) {
        customMin = firstIdxWithData - 1;
      } else {
        customMax = lastIdxWithData + 1;
      }
    }
    tickAmount = customMax - customMin;
  }

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
        enabled: !fullScreenOpen && !singleLabelMode && multiplePoints,
      },
    },
    grid: { borderColor: prefersDarkMode ? '#404040' : '#e0e0e0' },
    legend: { show: series.length !== 1 },
    xaxis: {
      type: 'numeric',
      min: customMin,
      max: customMax,
      tickAmount: tickAmount,
      tickPlacement: 'on',
      labels: {
        rotate: -45,
        style: { fontSize: '12px' },
        formatter: (val) => {
          if (singleLabelMode) {
            const numVal = Number(val);
            if (customCategories.length === 1) return customCategories[0];
            if (numVal === 0) return customCategories[0];
            if (numVal === 1) return customCategories[1];
            return '';
          }

          const n = Number(val);
          if (!isInteger(n)) return '';

          const idx = Math.round(n);
          if (idx < customMin || idx > customMax) return '';
          if (idx < 0 || idx >= categories.length) {
            if (idx < 0) {
              const firstCategory = categories[0];
              if (firstCategory) {
                const year = parseInt(firstCategory);
                const semType = firstCategory.slice(-1);
                if (semType === 'S') {
                  return `${year - 1}F`;
                } else if (semType === 'F') {
                  return `${year}S`;
                }
              }
            } else if (idx >= categories.length) {
              // After the end - get the year and generate next semester
              const lastCategory = categories[categories.length - 1];
              if (lastCategory) {
                const year = parseInt(lastCategory);
                const semType = lastCategory.slice(-1);
                if (semType === 'S') {
                  return `${year}F`;
                } else if (semType === 'F') {
                  return `${year + 1}S`;
                }
              }
            }
            return '';
          }

          return categories[idx] ?? '';
        },
      },
      axisTicks: { show: true },
    },
    yaxis: {
      min: 1,
      max: 4,
      labels: { formatter: (v) => (typeof v === 'number' ? v.toFixed(2) : '') },
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
    markers: { size: 5 },
    tooltip: {
      x: {
        formatter: (val, opts) => {
          const sIndex = opts?.seriesIndex;
          const dpIndex = opts?.dataPointIndex;
          if (sIndex != null && dpIndex != null)
            return (
              displaySemesterName(
                series[sIndex].data[dpIndex]?.semester,
                false,
              ) ?? ''
            );
          return '';
        },
      },
    },
    noData: {
      text: 'Please select a class to add',
      align: 'center',
      style: { fontSize: '14px', fontFamily: 'inherit' },
    },
    theme: { mode: prefersDarkMode ? 'dark' : 'light' },
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
