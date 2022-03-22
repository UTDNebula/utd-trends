<<<<<<< HEAD
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  Filler,
);

/**
 * This is a type the contains the props used by the VisualBubble and GraphChoice components
*/
type BubbleProps = {
  // Determine which of the charts will be used
  form: 'Bar' | 'Line' | 'Radar';
  // General information about the chart
  title: string;
  labels: string[];
  // dataset 1 information
  dataset1label: string;
  dataset1data: number[];
  // dataset 2 information
  dataset2label?: string;
  dataset2data?: number[];
  // dataset 3 information
  dataset3label?: string;
  dataset3data?: number[];
};

/**
 * This component returns a ChartJS Component built using the props passed to it
 * Simplifies the use of Graphs for use in the page components
*/
export const GraphChoice = (props: BubbleProps) => {
  // set chart options
  var options = {
    responsive: true,
    color: 'black',
    scales: {},
    chartArea: {
      backgroundColor: 'white',
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  // Make labels accessible to inner functions
  const labels = props.labels;

  // Initialize datasets of graphs
  let sets = [];

  // Initialize the properties of dataset 1 if the props were set
  if (
    typeof props.dataset1data != 'undefined' &&
    typeof props.dataset1label != 'undefined'
  ) {
    sets.push({
      label: props.dataset1label,
      data: props.dataset1data,
      fill: true,
      backgroundColor: 'rgba(255, 99, 132, 0.7)',
      borderColor: 'rgb(255, 99, 132)',
      pointBackgroundColor: 'rgb(255,0,0)',
      pointBorderColor: '#fff',
    });
  }

  // Initialize the properites of dataset 2 if the props were set
  if (
    typeof props.dataset2data != 'undefined' &&
    typeof props.dataset2label != 'undefined'
  ) {
    sets.push({
      label: props.dataset2label,
      data: props.dataset2data,
      borderColor: 'rgba(99, 255, 132,1)',
      backgroundColor: 'rgba(132, 255, 99, 0.7)',
      pointBackgroundColor: 'rgb(0,255,0)',
      pointBorderColor: '#fff',
    });
  }

  // Initialize the properties of dataset 3 if the props were set
  if (
    typeof props.dataset3data != 'undefined' &&
    typeof props.dataset3label != 'undefined'
  ) {
    sets.push({
      label: props.dataset3label,
      data: props.dataset3data,
      borderColor: 'rgb(132, 99, 255)',
      backgroundColor: 'rgba(132, 99, 255, 0.7)',
      pointBackgroundColor: 'rgb(0,0,255)',
      pointBorderColor: '#fff',
    });
  }

  // Join togehter the data properties
  const data = {
    labels,
    datasets: sets,
  };

  // Use the choice of graph in order to determine which chart component to return to the parent component
  switch (props.form) {
    case 'Bar': {
      return <Bar options={options} data={data} />;
    }
    case 'Line': {
      return <Line options={options} data={data} />;
    }
    case 'Radar': {
      // add aditional options for radar specific scales
      options.scales = {
        r: {
          beginAtZero: true,
          angleLines: { display: false },
          pointLabels: { color: 'black' },
          ticks: { color: 'black', backdropColor: 'white', display: false },
        },
      };
      //options.chartArea={backgroundColor:'white'}
      return <Radar options={options} data={data} />;
    }
    default: {
      //Use the Bar chart as the default return type
      return <Bar options={options} data={data} />;
    }
  }
};
=======
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { BarGraph } from './BarGraph';
import { LineGraph } from './LineGraph';
import { RadarChart } from './RadarChart';
import { RadialBarChart } from './RadialBarChart';
import GraphProps from '../modules/GraphProps';
import { VerticalBarGraph } from './VerticalBarGraph';
import { HorizontalBarGraph } from './HorizontalBarGraph';

/**
 * Creates the appropriate graph with it's corresponding props when given a graph type 
 */
export function GraphChoice(props: GraphProps) {

    switch(props.form){
        case 'Bar' : {
            return (
            <BarGraph 
            xaxisLabels={props.xaxisLabels}
            series={props.series}
            title = {props.title}
            ></BarGraph>
            );
        }
        case 'Line' : {
            return(
            <LineGraph
            xaxisLabels={props.xaxisLabels}
            series={props.series}
            title = {props.title}
            ></LineGraph>
            );
        }
        case 'Vertical' : {
            return(
                <VerticalBarGraph
                xaxisLabels={props.xaxisLabels}
                series={props.series}
                title = {props.title}
                ></VerticalBarGraph>
                );
        }
        case 'Horizontal' : {
            return(
                <HorizontalBarGraph
                xaxisLabels={props.xaxisLabels}
                series={props.series}
                title = {props.title}
                ></HorizontalBarGraph>
                );
        }
        case "Radar" : {
            return(
            <RadarChart
            xaxisLabels={props.xaxisLabels}
            series={props.series}
            title = {props.title}
            ></RadarChart>
            );
        }
        case 'Radial' : {
            return(
            <RadialBarChart
            labels={props.labels}
            series={props.series}
            title = {props.title}
            ></RadialBarChart>
            );
        }
        default : {
            return(
                <BarGraph 
                xaxisLabels={props.xaxisLabels}
                series={props.series}
                title = {props.title}
                ></BarGraph>
                );
        }
    }


}
>>>>>>> feature/visual-bubble
