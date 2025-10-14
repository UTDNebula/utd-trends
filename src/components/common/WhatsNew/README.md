This component displays what is new from the site's GitHub. On the top right corner, controls a button that will show the latest updates.
### ReleaseData Table
| Prop | Type | Description | Required |
| :- | :- | :- | -- |
| id | `number` | The ID of the GitHub update | Yes |
| name | `string` | A brief title describing the update | Yes |
| published_at | `string` | The date it update was published on | Yes |
| body | `string` | The main description of the update | Yes |
| html_url | `string` | the link to the update on GitHub | Yes |
### Feature Table
| Prop | Type | Description | Required |
| :- | :- | :- | -- |
| id | `string` | The string ID of the update | Yes |
| version | `string` | The version of the feature from the GitHub release content | Yes |
| date | `string` | The date the release content was published | Yes |
| content | `string` | A description of the content within the current feature | Yes |
| releaseURL | `string` | A string link to the release on GitHub | Yes |
| releaseID | `string` | The unique ID of this feature | Yes |
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