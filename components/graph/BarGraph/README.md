### Bar Graph Example
``` ts
const axisLabel = ['A','B','C','D','F'];
const data= [
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },
  ];
const name="Bar Graph Example";
<div style={{width:"100%", height:"300px"}}>
    <BarGraph 
        xaxisLabels={axisLabel}
        series={data}
        title = {name}
    ></BarGraph>
</div>
```

The component takes in standard ApexCharts properties.
It takes an 'axisLabel' which is an array of strings, in the example: 
`const axisLabel = ['A','B','C','D','F'];`