


### Radial Bar Chart Example
``` ts
const data= [ {name: "Three Point One", data: [(3.1/4)*100]}, {name: "Two Point Five", data: [(2.5/4)*100]}, {name: "Three Point Nine", data: [(3.9/4)*100]}];
const name="Bar Graph Example";
<div style={{width:"100%"}}>
    <RadialBarChart 
        series={data}
        title={name}
    ></RadialBarChart>
</div>
```