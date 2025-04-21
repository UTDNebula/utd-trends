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
  let aNum = parseInt(a);
  if (a.includes('S')) {
    aNum += 0.1;
  } else if (a.includes('U')) {
    aNum += 0.2;
  } else {
    aNum += 0.3;
  }
  let bNum = parseInt(b);
  if (b.includes('S')) {
    bNum += 0.1;
  } else if (b.includes('U')) {
    bNum += 0.2;
  } else {
    bNum += 0.3;
  }
  return aNum - bNum;
}

function getSemesterGPAs(
  data: {
    name: string;
    data: Grades['grades'];
  },
  allSemesters: string[],
) {
  const semesters = data.data
    //remove summer
    .filter((semester) => !semester._id.includes('U'))
    .toSorted((a, b) => sortSemesters(a._id, b._id))
    //get gpa and place in allSemesters
    .map((semester) => {
      const total: number = semester.grade_distribution.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );

      const GPALookup = [
        4, 4, 3.67, 3.33, 3, 2.67, 2.33, 2, 1.67, 1.33, 1, 0.67, 0,
      ];
      let gpa = 0;
      if (total !== 0) {
        gpa =
          GPALookup.reduce(
            (accumulator, currentValue, index) =>
              accumulator + currentValue * semester.grade_distribution[index],
            0,
          ) /
          (total -
            semester.grade_distribution[
              semester.grade_distribution.length - 1
            ]);
      }
      return {
        x: allSemesters.indexOf(semester._id) + 1,
        y: gpa,
      };
    });
  return {
    name: data.name,
    data: semesters,
  };
}

// Dynamically import react-apexcharts with SSR disabled.
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Props = {
  title: string;
  xAxisLabels?: string[];
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

  const noDataText = 'Please select a class to add';
  // get all semesters from all series
  const combinedSemesters = Array.from(
    new Set(
      props.series.flatMap((single) =>
        single.data.map((semester) => semester._id),
      ),
    ),
  )
    .filter((semester) => !semester.includes('U'))
    .toSorted(sortSemesters);
  // fill in semester inbetween
  const minSemester = combinedSemesters[0];
  const maxSemester = combinedSemesters[combinedSemesters.length - 1];
  const allSemesters: string[] = [];
  for (let i = parseInt(minSemester); i <= parseInt(maxSemester); i++) {
    if (i !== parseInt(minSemester) || minSemester.includes('S')) {
      allSemesters.push(i + 'S');
    }
    if (i !== parseInt(maxSemester) || maxSemester.includes('F')) {
      allSemesters.push(i + 'F');
    }
  }
  // format series with gpas and semester places
  const series = props.series.map((single) =>
    getSemesterGPAs(single, allSemesters),
  );

  const theme = useTheme();
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
        enabled:
          !fullScreenOpen &&
          // disable if only one data point cause it look weird
          !series.every((single) => single.data.length === 1),
      },
    },
    grid: {
      borderColor: prefersDarkMode ? '#404040' : '#e0e0e0',
    },
    legend: {
      show: series.length !== 1,
    },
    xaxis: {
      categories: allSemesters,
      tickAmount: allSemesters.length - 1, // Ensure all ticks are shown
      labels: {
        show: true,
        rotate: -45, // Rotate labels if necessary to fit them
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      min: 1,
      max: 4,
      labels: {
        formatter: (value: number) => value.toFixed(2),
      },
    },
    colors:
      series.length === 1
        ? [theme.vars.palette.primary.main]
        : compareColors.filter(
            (searchQuery, i) => props.includedColors?.[i] ?? 1,
          ),
    stroke: {
      curve: 'straight',
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
    markers: {
      size: 4,
    },
  };

  const graph = (
    <div className="h-full">
      <Chart options={options} series={series} type="line" height={'100%'} />
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
