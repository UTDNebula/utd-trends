This component is there to split the page between the left and right using `useRefImperativePanelHandle>(NULL)`.

### Props Table
| Prop | Type | Description | Required |
| :-- | :-- | :-- | --- |
| left | `React.ReactNode` | The rendered content shown in the LHS | Yes |
| right |`React.ReactNode` | The rendered content shown in the RHS | Yes |
| minLeft | `number` | Describes the minumum size of the left panel | Yes |
| minRight | `number` | Describes the minimum size of the right panel | Yes |
| defaultLeft | `number` | Used to reset the panels when double-clicking and to set the default size of the panel | Yes |

### Split Example

```jsx
import React from 'react';

const leftSide = (
  <h1 className="text-white bg-cornflower-400 rounded-md text-center font-display ml-5 my-5">
    Left Side
  </h1>
);
const rightSide = (
  <h1 className="text-white bg-cornflower-400 rounded-md text-center font-display mr-5 my-5">
    Right Side
  </h1>
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