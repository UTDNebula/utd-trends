GraphChoice component can receive a `form` through `GraphProps` and can return any of the other graph components. 
`form` can be any of the following `'Bar', 'Line', 'Radar', 'Vertical', 'Horizontal', 'Radial', or 'BoxWhisker'`. 

### Interactive Graph Choice Example

Change the `form` of the GraphChoice using the buttons at the bottom. This example shows how the same data can be passed to a GraphChoice component, but by changing the `form` you can display that same data in different chart types. 
Also play around with the component to understand that the length of the `series` array is a different thing than the length of the `data` arrays inside the objects of the `series` array. 
One thing this example shows is how `RadialBarChart` requries `data` arrays of length one, but this also makes the `LineGraph`s and `RadarChart`s meaningless. 

```ts
const [radialFlag, setRadialFlag] = React.useState(false); //radialFlag is used to change color of a button and the series props to highlight when the length of `data`s are breaking the RadialBarChart
const [currentForm, setCurrentForm] = React.useState("Bar");
const [myWidth, setMyWidth] = React.useState("100%"); //needed to control the size of the RadialBar. Without this, the Radial takes up more space than its container. 
const changeToRadial = () => {
  setRadialFlag(true);
  setMyWidth("300px");
  setCurrentForm("Radial");
}
const changeToNonRadial = (newForm) => {
  //newForm should be a string that matches an acceptable chart 'form' (other than Radial)
  setRadialFlag(false);
  setMyWidth("100%");
  setCurrentForm(newForm);
}
const startAxisLabel = ['A','B','C','D','F'];
const startData= [
  { name: 'Smith', data: [1, 2, 3, 4, 1] },
  { name: 'Jason', data: [2, 5, 1, 6, 9] },
  { name: 'Suzy', data: [2, 5, 2, 1, 1] },
];
const [currentData, setCurrentData] = React.useState(startData);
const shrinkData = () => {
  setRadialFlag(false); //if data is shrunk, there is no need to highlight the error, so change the colors back to white
  //the smallData[x].data all have length 1 so they can be displayed in Radial 
  const smallData = [
    { name: 'Smith', data: [20] },
    { name: 'Jason', data: [60] },
    { name: 'Suzy', data: [50] },
  ]
  setCurrentData(smallData);
}
const resetData = () => {
  setCurrentData(startData);
}
const decrementDataSetCount = () => {
  //remove the last entry of currentData
  const newData = currentData.slice(0, currentData.length-1);
  setCurrentData(newData);
};
const incrementDataSetCount = () => {
  let newData;
  //if a Radial, then add an object with data.length == 1, and mult by 100 for proper scaling as a percentage
  if (currentForm == "Radial") {
    newData = [ ...currentData,
    { name: 'Jason', data: [Math.floor(Math.random()*100)] },
  ];
  //otherwise, add 5 each random from 1-10 to the end of the previous currentData array
  } else {
    newData = [ ...currentData,
    { name: 'Jason', data: [Math.floor(Math.random()*10), Math.floor(Math.random()*10), Math.floor(Math.random()*10), Math.floor(Math.random()*10), Math.floor(Math.random()*10)] },
  ];}
  setCurrentData(newData);
};
const name="Graph Choice Example";
<div style={{width: "100%"}}>
  <div style={{width: myWidth, height: "300px"}}>
    {(currentForm!=="Radial" || currentData[0].data.length === 1) ? //if Radial AND too much data, give error block instead of GraphChoice component
      <GraphChoice 
          form={currentForm}
          xaxisLabels={startAxisLabel}
          series={currentData}
          title={name}
      ></GraphChoice>
    : <div style={{padding: "5rem", backgroundColor: "#f5c4be", borderRadius: "6px"}}>
        <div>Uh oh..</div>
        <div>Radial graph <code>data</code> arrays need to only have one entry!</div>
      </div>}
  </div>
  <div style={{display: "flex", flexDirection: "horizontal", margin: "0.5rem"}}>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(changeToNonRadial("Bar"))}>Bar</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(changeToNonRadial("Vertical"))}>Vertical</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(changeToNonRadial("Horizontal"))}>Horizontal</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(changeToNonRadial("Line"))}>Line</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(changeToNonRadial("Radar"))}>Radar</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(changeToRadial())}>Radial</button>
  </div>
  <div style={{display: "flex", flexDirection: "horizontal", margin: "0.5rem"}}>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(resetData())}>Reset Data</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(incrementDataSetCount())}>Add Another Series</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem"}} onClick={(e)=>(decrementDataSetCount())}>Remove A Series</button>
    <button style={{border: "1px solid black", borderRadius: "6px", margin: "0.65rem", padding: "0.5rem", backgroundColor: !radialFlag ? '#fff' : '#f5c4be' }} onClick={(e)=>(shrinkData())}>Change data to a set with one entry each</button>
  </div>
  <div style={{margin: "1.5rem", marginTop: "2.5rem"}}>Current props being passed to the <code>GraphChoice</code> component:
    <div style={{border: "1px solid black", borderRadius: "6px", padding: "1rem"}}><code>
      <div style={{magin: "0.5rem", padding: "0.25rem"}}>&lt;GraphChoice</div>
      <div style={{magin: "0.5rem", padding: "0.25rem", marginLeft: "2rem"}}><strong>form</strong> = "{currentForm}"</div>
      <div style={{magin: "0.5rem", padding: "0.25rem", marginLeft: "2rem"}}><strong>xaxisLabels</strong> = [{startAxisLabel.map(label => label+", ")}]</div>
      <div style={{magin: "0.5rem", padding: "0.25rem", marginLeft: "2rem", backgroundColor: !radialFlag ? '#fff' : '#f5c4be'}}><strong>series</strong> = [{currentData.map(data => JSON.stringify(data)+",  ")}]</div>
      <div style={{magin: "0.5rem", padding: "0.25rem", marginLeft: "2rem"}}><strong>title</strong> = "{name}"</div>
      <div style={{magin: "0.5rem", padding: "0.25rem"}}>&gt;&lt;/GraphChoice&gt;</div></code>
    </div>
  </div>
</div>

```
