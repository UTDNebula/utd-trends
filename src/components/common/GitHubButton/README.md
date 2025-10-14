This component is for developer use. It shows the most recent GitHub commit once clicked. It is located at the bottom left.
### GitHubButton Example

```jsx
import GitHub from '@mui/icons-material/GitHub';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';

function GitHubButton() {
  return (
    <>
      <div className="pt-15 ml-7 pb-7">
        <Tooltip title="Open GitHub commit for this instance">
          <IconButton size="large">
            <svg
              width="70"
              height="70"
              viewBox="0 0 24 24"
              className="absolute"
            >
              <circle cx="12" cy="12" r="10" fill="#ffffff" />
            </svg>
            <GitHub className="fill-black text-3xl bg-white absolute" />
          </IconButton>
        </Tooltip>
      </div>
    </>
  );
}

<GitHubButton></GitHubButton>;
```