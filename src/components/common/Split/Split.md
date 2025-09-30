Split component to make a draggable left and right side. It divides the page into two sides: LHS and RHS. (The RHS typically shows the overall data for a course/ professor and the LHS typically shows the breakdowns for search criteria. )

### Props Table

| Prop          | Type              | Description                                                      | Required |
| :------------ | :---------------- | :--------------------------------------------------------------- | -------- |
| `left`        | `React.ReactNode` | The rendered content shown in the LHS, can accept any React node | Yes      |
| `right`       | `React.ReactNode` | The rendered content shown in the RHS, can accept any React node | Yes      |
| `minLeft`     | `number`          | Minimum size of the LHS                                          | Yes      |
| `minRight`    | `number`          | Minimum size of the RHS                                          | Yes      |
| `defaultLeft` | `number`          | Default size of the LHS                                          | Yes      |

### Split Example

```jsx
import React from 'react';

const leftSide = (
  <h1 className="text-white bg-purple-500 text-center ml-5 my-5">Left Side</h1>
);
const rightSide = (
  <h1 className="text-white bg-purple-500 text-center mr-5 my-5">Right Side</h1>
);

<Split
  left={leftSide}
  right={rightSide}
  minLeft={30}
  minRight={30}
  defaultLeft={40}
  className=""
></Split>;
```
