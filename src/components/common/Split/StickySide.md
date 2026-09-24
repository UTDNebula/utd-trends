This Component allows the `React` components to stick at the top of the page while the user scrolls down.

### Props Table

| Prop     | Type              | Description                               | Required |
| :------- | :---------------- | :---------------------------------------- | -------- |
| children | `React.ReactNode` | The displayed component of any React kind | Yes      |

### Sticky Side Example

```jsx
import React from 'react';

const sampleNode = (
  <h1 className="text-white bg-cornflower-400 rounded-md text-center mx-5 font-display">
    Sample Content
  </h1>
);

<>
  <div className="overflow-y-scroll h-50">
    <div className="h-15"></div>
    <StickySide>{sampleNode}</StickySide>
    <div className="h-90"></div>
  </div>
</>;
```
