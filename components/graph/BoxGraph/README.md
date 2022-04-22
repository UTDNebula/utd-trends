
The `BoxGraph` component takes in props in a different form. It uses `xaxisLabels` and `series`, but `series` should be an array of objects, each with an `x` and `y`, where `x` is a string label and `y` is an array of numbers. 

### Box Graph Example
``` ts
const axisLabel = ['A','B','C','D','F'];
const data= [
    { x: 'Smith', y: [1, 2, 5, 4, 1] },
    { x: 'Jason', y: [2, 5, 1, 6, 9] },
    { x: 'Suzy', y: [2, 5, 3, 3, 1] },
  ];
const name="Bar Graph Example";
<div style={{width:"100%", height:"400px"}}>
    <BoxGraph 
        xaxisLabels={axisLabel}
        series={data}
        title={name}
    ></BoxGraph>
</div>
```