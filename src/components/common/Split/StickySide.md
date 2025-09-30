This component allows React components on Trends to be formatted as sticky (when page is scrolled down, the component sticks to the top and remains on the screen).

### Props Table

| Prop       | Type              | Description                                         | Required |
| :--------- | :---------------- | :-------------------------------------------------- | -------- |
| `children` | `React.ReactNode` | The component to display, can accept any React node | Yes      |

### StickySide Example

```jsx
import React from 'react';

const sampleNode = (
  <h1 className="text-white bg-purple-400 text-center mx-5">Sample Content</h1>
);

<>
  <div className="overflow-y-scroll h-50">
    <div className="h-15"></div>
    <StickySide>{sampleNode}</StickySide>
    <div className="h-90"></div>
  </div>
</>;
```
