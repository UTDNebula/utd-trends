
The `BoxGraph` component does not actually utilize the `xaxisLabels`. 

### Box Graph Example
``` ts
const startData= [
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },
  ];
const [currentData, setCurrentData] = React.useState(startData);
const decrementDataSetCount = () => {
  // const newData = currentData.filter((value, index) => { index < currentData.length-1})
  const newData = currentData.slice(1, currentData.length);
  setCurrentData(newData);
};
const incrementDataSetCount = () => {
  const newData = [ ...currentData,
    { name: Math.random().toString().substr(2, 8), data: [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)] },
  ];
  setCurrentData(newData);
};
const resetGraph = () => {
  setCurrentData(startData);
}
const name="Bar Graph Example";
<div style={{width:"100%", height:"300px"}}>
  <BoxGraph 
      series={currentData}
      title={name}
  ></BoxGraph>
  <div style={{margin: "1.5rem", marginTop: "2.5rem"}}>Current props being passed to the <code>BoxGraph</code> component:
    <div style={{border: "1px solid black", borderRadius: "6px", padding: "1rem"}}><code>
      <div style={{magin: "0.5rem", padding: "0.25rem"}}>&lt;BoxGraph</div>
      <div style={{magin: "0.5rem", padding: "0.25rem", marginLeft: "2rem"}}><strong>series</strong> = [{currentData.map(data => JSON.stringify(data)+",  ")}]</div>
      <div style={{magin: "0.5rem", padding: "0.25rem", marginLeft: "2rem"}}><strong>title</strong> = "{name}"</div>
      <div style={{magin: "0.5rem", padding: "0.25rem"}}>&gt;&lt;/BoxGraph&gt;</div></code>
    </div>
  </div>
  <div style={{display: "flex", flexDirection: "horizontal", margin: "1rem"}}>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(incrementDataSetCount())}>Add Another Series</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(decrementDataSetCount())}>Remove A Series</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(resetGraph())}>Reset Graph</button>
  </div>
</div>
```
