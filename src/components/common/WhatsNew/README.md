WhatsNewButton component that shows the latest feature from GitHub releases. The button for it is located at the top (immediately to the right of the `My Planner` button). Once clicked, it shows a scrollable list of updates (each with the version number, date of update, and description).

### WhatsNew Example

```jsx
import { Badge, IconButton, Popover, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const [unread, setUnread] = useState(true);
const [anchorEl, setAnchorEl] = React.useState(null);

const handleClick = (event) => {
  setAnchorEl(event.currentTarget);
  setUnread(false);
};

const handleClose = () => {
  setAnchorEl(null);
};

const open = Boolean(anchorEl);
const id = open ? 'simple-popover' : undefined;

<>
  <div className="flex justify-end mr-30 py-3">
    <Tooltip title="See What's New in Trends!">
      <IconButton
        className="aspect-square"
        size="medium"
        onClick={handleClick}
        aria-describedby="whats-new-popover"
      >
        {unread ? (
          <Badge color="primary" badgeContent=" ">
            <InfoOutlinedIcon className="text-3xl" />
          </Badge>
        ) : (
          <InfoOutlinedIcon className="text-3xl" />
        )}
      </IconButton>
    </Tooltip>
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <div className="p-4 w-64 bg-white dark:bg-haiti rounded-md max-h-[80vh] overflow-y-auto">
        <h3 className="font-bold mb-3 text-base text-center">
          What&apos;s New?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No updates available
        </p>
      </div>
    </Popover>
  </div>
</>;
```
