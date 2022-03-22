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
