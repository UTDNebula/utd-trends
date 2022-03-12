import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { BarGraph } from './BarGraph';
import { LineGraph } from './LineGraph';
import { RadarChart } from './RadarChart';
import { RadialBarChart } from './RadialBarChart';
import GraphProps from '../modules/GraphProps';

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