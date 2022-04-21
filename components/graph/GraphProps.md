## GraphProps

GraphProps is not a component, but defines the structure of props passed to graph components. GraphProps is based on standard ApexCharts properties. You can read about these on [ApexCharts Docs](https://apexcharts.com/docs/series/).  

`labels` is only needed for the radial bar component. `form` specifies the type of graph (Bar, Line, Radar, etc.) for the GraphChoice component.  

The structure of `GraphProps` is shown below. 

>`type GraphProps = {  `
>  
>`  form?: 'Bar' | 'Line' | 'Radar' | 'Vertical' | 'Horizontal' |'Radial'|'BoxWhisker';  `
>  
>`  xaxisLabels?: string[];  `
>  
>`  series: any[];  `
>  
>`  title: string;  `
>  
>`  labels?: string[]  `
>  
>`};  `

