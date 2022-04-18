import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import GraphProps from '../../../modules/GraphProps';
import React from "react";

/**
 * Creates a pre-configured Apexcharts radial bar graph component
 * @param props 
 * @returns radial bar graph
 */
  export function RadialBarChart(props: GraphProps) {
    const options: ApexOptions = {
      chart: {
        id: 'bar',
        zoom: {
          enabled: false,
        },
      },
      labels: props.labels,
      colors: ['#ffadad', '#9bf6ff', '#caffbf'],
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
      plotOptions:{
        radialBar:{
          dataLabels:{
            show:true,
            total:{
              show:true,
              label:"Average",
              color:"#000000"
            }
          }
        }
      }
    };
  
    return (
      <>
        <div className="h-full">
          <Chart
            options={options}
            series={props.series}
            type="radialBar"
            width={'100%'}
          />
        </div>
      </>
    );
  }
