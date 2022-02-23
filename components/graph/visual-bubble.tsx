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
import { Chart } from 'react-chartjs-2'
import { Bar } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import { Radar } from "react-chartjs-2";
import { Card } from '@mui/material'
import { GraphChoice } from './GraphChoice'

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
  )




type BubbleProps ={
    //Determine which of the charts will be used
    form: "Bar" | "Line" | "Radar"
    //General information about the chart
    title:string
    labels: string[]
    //dataset 1 information
    dataset1label:string
    dataset1data: number[]
    //dataset 2 information
    dataset2label?:string
    dataset2data?: number[]
    //dataset 3 information
    dataset3label?:string
    dataset3data?: number[]
}

const VisualBubble = (props:BubbleProps) => {
    return <>
    <Card className='bg-light relative w-full h-1/2 overflow-visible mb-12 drop-shadow-lg rounded-xl'>
        <div className='w-11/12 m-auto left-1/2 -translate-y-12'>
            <Card className='bg-primary-light rounded-xl drop-shadow-lg'>
                <GraphChoice 
                    form={props.form} 
                    title={props.title} 
                    labels={props.labels} 
                    dataset1label={props.dataset1label} 
                    dataset1data={props.dataset1data}
                    dataset2label={props.dataset2label}
                    dataset2data={props.dataset2data}
                    dataset3label={props.dataset3label}
                    dataset3data={props.dataset3data}
                />
            </Card>
        </div>
        <div className='absolute bottom-0 p-4 text-dark'>
            <h1 className='italic'>{props.title}</h1>
        </div>
            
    
        
    </Card>
        
    </>
}

export default VisualBubble;