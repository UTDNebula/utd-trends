### Props Table

| Prop        | Type      | Description                                                               | Required |
| :---------- | :-------- | :------------------------------------------------------------------------ | -------- |
| `isPlanner` | `boolean` | A boolean that indicates whether the page being shown is the Planner page | Yes      |

### TopMenu Example

```tsx
import BookIcon from '@mui/icons-material/Book';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ShareIcon from '@mui/icons-material/Share';
import { Button, IconButton, Snackbar, Tooltip } from '@mui/material';
import React from 'react';

function TopMenu({ isPlanner = false }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        padding: 12,
        background: '#f7f7fb',
      }}
    >
      <div
        style={{
          fontWeight: 700,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#2b6cb0" />
        </svg>
        <span>UTD TRENDS</span>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <Button variant="contained" color="primary">
          <BookIcon style={{ marginRight: 8 }} />
          {isPlanner ? 'Search Results' : 'My Planner'}
        </Button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Tooltip title="Open Tutorial">
          <IconButton>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Share Link">
          <IconButton>
            <ShareIcon />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

<TopMenu isPlanner={false} />;
```
