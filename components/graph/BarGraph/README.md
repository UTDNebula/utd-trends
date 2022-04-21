The component takes in standard ApexCharts properties. You can read about these on [ApexCharts Docs](https://apexcharts.com/docs/series/).  

Our example uses `xaxisLabels`, `series` and `title` props, where `series` has a format of an array of objects, each with a `name` and a `data`.  

`const data= [  
    { name: 'Smith', data: [1, 2, 3, 4, 1] },  
    { name: 'Jason', data: [2, 5, 1, 6, 9] },  
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },  
  ];`  

### Bar Graph Example
``` ts
const axisLabel = ['A','B','C','D','F'];
const data= [
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },
  ];
const name="Bar Graph Example";
let width = "100%";
<div style={{width:width, height:"300px"}}>
    <BarGraph 
        xaxisLabels={axisLabel}
        series={data}
        title={name}
    ></BarGraph>
</div>
```


