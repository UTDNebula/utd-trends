Trends uses this component in SingleGradesInfo, which is where a graph of a grade distribution for an entire class or prof is displayed, and Compare, which is where a graph of different grade distributions for each selected prof in the 'Compare' tab is displayed.

### Props Table

| Prop       | Type              | Description                                                 | Required |
| :--------- | :---------------- | :---------------------------------------------------------- | -------- |
| `state`    | `string`          | Informs the component about loading status so it can show a placeholder when data is still being fetched | Yes      |
| `bar`      | `React.ReactNode` | The rendered content to show when the bar chart view is active, can accept any React node        | No       |
| `line`     | `React.ReactNode` | The rendered content to show when the line chart view is active, can accept any React node        | No       |

### GraphToggle Example

```jsx

const barNode = (
  <div className="w-full h-64 flex items-center justify-center bg-slate-50">
    Bar chart placeholder
  </div>
);

const lineNode = (
  <div className="w-full h-64 flex items-center justify-center bg-slate-50">
    Line chart placeholder
  </div>
);

<GraphToggle state="ready" bar={barNode} line={lineNode} />

// Loading example (JSX):
// <GraphToggle state="loading" />

```