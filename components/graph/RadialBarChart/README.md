### Radial Bar Chart Example
``` ts
const axisLabel = ['A','B','C'];
const data= [(3.1 / 4) * 100, (2.6 / 4) * 100, (3.9 / 4) * 100];
const name="Bar Graph Example";
<div style={{width:"100%"}}>
    <RadialBarChart 
        xaxisLabels={axisLabel}
        labels={['Jason','Kelly','Smith']}
        series={data}
        title = {name}
    ></RadialBarChart>
</div>
```