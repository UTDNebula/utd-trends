This component displays search results in a table. It takes `numSearches`, `includedResults`, and `unIncludedResults` as props. `numSearches` is used to determine which row should show a tutorial tooltip (`showTutorial`). Both `includedResults` and `unIncludedResults` are sorted according to the table’s current sort state (`orderBy` and `order`). Each item in `includedResults` is mapped into a `Row` component, which handles expandable details and actions like “Add to Compare” or “Add to Planner.” After the included results, a divider row is displayed, followed by each `unIncludedResults` item as its own `Row`.

### Props Table

| Prop                | Type            | Description                                                                  | Required |
| :------------------ | :-------------- | :--------------------------------------------------------------------------- | -------- |
| `numSearches`       | `number`        | The index of the last row in search results                                  | Yes      |
| `includedResults`   | `SearchQuery[]` | The results that exist, and the prof is teaching in the current semester     | Yes      |
| `unIncludedResults` | `SearchQuery[]` | The results that exist, but the prof is not teaching in the current semester | Yes      |

### SearchResultsTable Example

```jsx
import React from 'react';
import SearchResultsTable from './SearchResultsTable';

// Mock SearchQuery objects
const mockIncludedResults = [
  {
    prefix: 'CS',
    number: '1200',
    profFirst: 'Gordon',
    profLast: 'Arnold',
  },
  {
    prefix: 'CS',
    number: '1200',
    profFirst: 'Klyne',
    profLast: 'Smith',
  },
];

const mockUnIncludedResults = [
  {
    prefix: 'CS',
    number: '1200',
    profFirst: 'John',
    profLast: 'Cole',
  },
];

<SearchResultsTable
  numSearches={2}
  includedResults={mockIncludedResults}
  unIncludedResults={mockUnIncludedResults}
/>;
```
