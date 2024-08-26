### TabNavMenu Example

```ts
import { useState } from 'react';
const [val, setVal] = useState(0);
const turn = (displacement) => {
  setVal(val + displacement);
};
<TabNavMenu value={val} turner={turn} />;
```
