### Radial Bar Chart Example

```ts
const startData = [
  { name: 'Smith', data: [45] },
  { name: 'Jason', data: [68] },
  { name: 'Suzy', data: [85] },
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
      data: [Math.floor(Math.random() * 100)],
    },
  ];
  setCurrentData(newData);
};
const resetGraph = () => {
  setCurrentData(startData);
};
const name = 'Bar Graph Example';
<div>
  <div style={{ width: '50%' }}>
    <RadialBarChart series={currentData} title={name}></RadialBarChart>
  </div>
  <div style={{ margin: '1.5rem', marginTop: '2.5rem' }}>
    Current props being passed to the <code>RadialBarChart</code> component:
    <div
      style={{
        border: '1px solid black',
        borderRadius: '6px',
        padding: '1rem',
      }}
    >
      <code>
        <div style={{ magin: '0.5rem', padding: '0.25rem' }}>
          &lt;RadialBarChart
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
          &gt;&lt;/RadialBarChart&gt;
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
      onClick={(e) => resetGraph()}
    >
      Reset Graph
    </button>
  </div>
</div>;
```
