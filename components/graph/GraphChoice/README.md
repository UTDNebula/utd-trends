GraphChoice component can receive a `form` through `GraphProps` and can return any of the other graph components. 
`form` can be any of the following `'Bar', 'Line', 'Radar', 'Vertical', 'Horizontal', 'Radial', or 'BoxWhisker'`. 

### Interactive Graph Choice Example

Change the `form` of the GraphChoice using the buttons at the bottom. This example shows how the same data can be passed to a GraphChoice component, but by changing the `form` you can display that same data in different chart types. 

```ts
const [myForm, setMyForm] = React.useState("Bar");
const axisLabel = ['A','B','C','D','F'];
const data= [
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },
  ];
const name="Graph Choice Example";
<div style={{width:"100%", height:"300px"}}>
  <GraphChoice 
      form={myForm}
      xaxisLabels={axisLabel}
      series={data}
      title={name}
  ></GraphChoice>
  <div style={{display: "flex", flexDirection: "horizontal", margin: "1.5rem", marginTop: "2.5rem"}}>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(setMyForm("Bar"))}>Bar</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(setMyForm("Line"))}>Line</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(setMyForm("Radar"))}>Radar</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(setMyForm("Vertical"))}>Vertical</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(setMyForm("Horizontal"))}>Horizontal</button>
  </div>
</div>

```

### GraphProps

Form specifies the type of graph for the GraphChoice component
labels is only needed for the radial bar component. 


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
>  
>`export default GraphProps;  `
