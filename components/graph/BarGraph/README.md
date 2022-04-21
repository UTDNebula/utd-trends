The component takes in standard ApexCharts properties via `GraphProps`. You can read about these properties on [ApexCharts Docs](https://apexcharts.com/docs/series/).  

The BarGraph component only actually uses `xaxisLabels`, `series` and `title` props, where `series` has a format of an array of objects, each with a `name` and a `data`. The `series` used in the example below is as follows:  

`series = {[  
    { name: 'Smith', data: [1, 2, 3, 4, 1] },  
    { name: 'Jason', data: [2, 5, 1, 6, 9] },  
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },  
  ]}`  

The `xaxisLabels` are given independently as their own prop. In the example, they are the A, B, C, etc. The length of the `xaxisLabels` array should match the length of each `data` array inside of each `series` object. 

### Bar Graph Example
``` ts
const axisLabel = ['A','B','C','D','F'];
const startData= [
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },
  ];
const [currentData, setCurrentData] = React.useState(startData);
const updateDataOneSet = () => {
  const newData = [ { name: 'Smith', data: [1, 2, 3, 4, 1] } ];
  setCurrentData(newData);
};
const updateDataTwoSets = () => {
  const newData = [ 
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
  ];
  setCurrentData(newData);
};
const updateDataThreeSets = () => {
  const newData = [
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },
  ];
  setCurrentData(newData);
};
const name="Bar Graph Example";
<div style={{width:"100%", height:"300px"}}>
  <BarGraph 
      xaxisLabels={axisLabel}
      series={currentData}
      title={name}
  ></BarGraph>
  <div style={{display: "flex", flexDirection: "horizontal", margin: "1.5rem", marginTop: "2.5rem"}}>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(updateDataOneSet())}>One Data Set</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(updateDataTwoSets())}>Two Data Sets</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(updateDataThreeSets())}>Three Data Sets</button>
  </div>
</div>
```


