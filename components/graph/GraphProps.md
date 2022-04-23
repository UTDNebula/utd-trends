## GraphProps

GraphProps is not a component, but defines the structure of props passed to graph components. GraphProps is based on standard ApexCharts properties. You can read about these on [ApexCharts Docs](https://apexcharts.com/docs/series/).  

`form` specifies the type of graph (Bar, Line, Radar, etc.) for the GraphChoice component.  

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



`series` has a format of an array of objects, each with a `name` and a `data`, where `data` is an array of numbers. However, `RadialBarChart` requires each `data` array to be of length one.

`series = [  
    { name: 'Smith', data: [1, 2, 3, 4, 1] },  
    { name: 'Jason', data: [2, 5, 1, 6, 9] },  
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },  
  ]`  

`xaxisLabels` can take the form of an array of strings, such as:

`xaxisLabels = ['A', 'B', 'C', 'D']`

Some components (`BoxGraph`, `LineGraph`, `RadarChart` and `RadialBarChart`) will ignore extra `xaxisLabels`, "extra" meaning that there are more labels than there are entries in the data. Other components (`BarGraph`, `HorizontalBarGraph` and `VerticalBarGraph`) will display the extra labels and all the labels will be misaligned, so for these three bar graph components, make sure the correct number of `xaxisLabels` are passed in. 