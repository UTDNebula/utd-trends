The BarGraph component only uses `xaxisLabels`, `series` and `title` props.

The interactive example below demonstrates and displays the structure and function of the props. It also shows what happens when the length of the `xaxisLabels` array is not equal to the length of each `data` array inside of each `series` object. (Hint: the labels misalign and basically become meaningless)  
If all entries of `series` array are removed, the user is prompted to "select a class" in order to view data.

### Bar Graph Example

```ts
const axisLabel = ['A', 'B', 'C', 'D', 'F'];
const startData = [
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
  const newData = [
    ...currentData,
    {
      name: Math.random().toString().substr(2, 8),
      data: [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
      ],
    },
  ];
  setCurrentData(newData);
};
const [currentAxisLabel, setCurrentAxisLabel] = React.useState(axisLabel);
const addAxisLabels = () => {
  const newAxisLabel = [...currentAxisLabel, 'X', 'Y', 'Z'];
  setCurrentAxisLabel(newAxisLabel);
};
const resetGraph = () => {
  setCurrentAxisLabel(axisLabel);
  setCurrentData(startData);
};
const name = 'Bar Graph Example';
<div style={{ width: '100%', height: '300px' }}>
  <BarGraph
    xaxisLabels={currentAxisLabel}
    series={currentData}
    title={name}
  ></BarGraph>
  <div style={{ margin: '1.5rem', marginTop: '2.5rem' }}>
    Current props being passed to the <code>BarGraph</code> component:
    <div
      style={{
        border: '1px solid black',
        borderRadius: '6px',
        padding: '1rem',
      }}
    >
      <code>
        <div style={{ magin: '0.5rem', padding: '0.25rem' }}>&lt;BarGraph</div>
        <div
          style={{ magin: '0.5rem', padding: '0.25rem', marginLeft: '2rem' }}
        >
          <strong>xaxisLabels</strong> = [
          {currentAxisLabel.map((label) => label + ', ')}]
        </div>
        <div
          style={{ magin: '0.5rem', padding: '0.25rem', marginLeft: '2rem' }}
        >
          <strong>series</strong> = [
          {currentData.map((data) => JSON.stringify(data) + ',  ')}]
        </div>
        <div
          style={{ magin: '0.5rem', padding: '0.25rem', marginLeft: '2rem' }}
        >
          <strong>title</strong> = "{name}"
        </div>
        <div style={{ magin: '0.5rem', padding: '0.25rem' }}>
          &gt;&lt;/BarGraph&gt;
        </div>
      </code>
    </div>
  </div>
  <div style={{ display: 'flex', flexDirection: 'horizontal', margin: '1rem' }}>
    <button
      style={{
        border: '1px solid black',
        borderRadius: '6px',
        margin: '0.65rem',
        padding: '0.5rem',
      }}
      onClick={(e) => incrementDataSetCount()}
    >
      Add Another Series
    </button>
    <button
      style={{
        border: '1px solid black',
        borderRadius: '6px',
        margin: '0.65rem',
        padding: '0.5rem',
      }}
      onClick={(e) => decrementDataSetCount()}
    >
      Remove A Series
    </button>
    <button
      style={{
        border: '1px solid black',
        borderRadius: '6px',
        margin: '0.65rem',
        padding: '0.5rem',
      }}
      onClick={(e) => addAxisLabels()}
    >
      Add Three xaxisLabels
    </button>
    <button
      style={{
        border: '1px solid black',
        borderRadius: '6px',
        margin: '0.65rem',
        padding: '0.5rem',
      }}
      onClick={(e) => resetGraph()}
    >
      Reset Graph
    </button>
  </div>
</div>;
```
