import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import GraphProps from '../../../modules/GraphProps';
import React from 'react';
import { Card, Modal, Fade } from '@mui/material';
import { FullscreenOpenIcon } from '../../icons/FullscreenOpenIcon/fullscreenOpenIcon';
import { FullscreenCloseIcon } from '../../icons/FullscreenCloseIcon/fullscreenCloseIcon';

/**
 * Creates a pre-configured ApexCharts radial bar graph component. Takes in `series` and `title` `GraphProps`. The `data` fields in `series` need to each be arrays with just one entry.
 * @param props
 * @returns radial bar graph
 */
export function RadialBarChart(props: GraphProps) {
  //make series accepted as normal { name: "", data: [num] } structure.
  //labels array will be created by taking the 'name' from every entry in series
  //series array will be created by taking the 'data' from every entry in series
  const compiledLabels = props.series.map((value) => value.name);
  const compiledSeries = props.series.map((value) => value.data);

  const [fullScreenOpen, setFullScreenOpen] = useState<boolean>(false);

  const icon =
    '<div class="apexcharts-menu-icon">' +
    (fullScreenOpen ? FullscreenCloseIcon : FullscreenOpenIcon) +
    '</div>';

  const options: ApexOptions = {
    chart: {
      id: 'bar',
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
              click: (chart, options, e) => setFullScreenOpen(!fullScreenOpen),
            },
          ],
        },
      },
    },
    labels: compiledLabels,
    colors: ['#eb5757', '#2d9cdb', '#499F68'],
    stroke: {
      width: 2,
    },
    title: {
      text: props.title,
      align: 'left',
    },
    noData: {
      text: 'Please select a class to add',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: 0,
      offsetY: 0,
      style: {
        color: undefined,
        fontSize: '14px',
        fontFamily: undefined,
      },
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          show: true,
          total: {
            show: true,
            label: 'Average',
            color: '#000000',
          },
        },
      },
    },
  };

  const graph = (
    <div className="h-full">
      <Chart
        options={options}
        series={compiledSeries}
        type="radialBar"
        width={'100%'}
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
