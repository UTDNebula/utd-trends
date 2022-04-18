### Horizontal Bar Graph Example
``` ts
const axisLabel = ['A','B','C','D','F'];
const data= [
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },
  ];
const name="Bar Graph Example";
<div style={{width:"100%", height:"400px"}}>
    <HorizontalBarGraph
        xaxisLabels={axisLabel}
        series={data}
        title = {name}
    ></HorizontalBarGraph>
</div>
```