import BookMarkIcon from '@mui/icons-material/Bookmark';
import CollectionsBookMarkIcon from '@mui/icons-material/CollectionsBookmark';
import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box,
  Checkbox,
  Collapse,
  Grid2,
  IconButton,
  Item,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

function ExpandedTableHead() {
  return (
    <TableRow
      sx={{
        width: '100%',
        height: '20px',
        '& .MuiTableCell-root': {
          padding: '8px', // Reduce cell padding
          height: '10px', // Ensure cells match row height
        },
      }}
      className="bg-[#9986e3]"
    >
      <TableCell>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.70rem', color: 'white', lineHeight: 1, pl: 2 }}
        >
          Add
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.70rem', color: 'white', lineHeight: 1, pl: 2 }}
        >
          Class #
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.70rem', color: 'white', lineHeight: 1 }}
        >
          Subject
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.70rem', color: 'white', lineHeight: 1, pl: 1 }}
        >
          Course #
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.70rem', color: 'white', lineHeight: 1 }}
        >
          Section #
        </Typography>
      </TableCell>
      <TableCell sx={{ width: '30%' }}>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.70rem', color: 'white', lineHeight: 1, pl: 2 }}
        >
          Schedule & Location
        </Typography>
      </TableCell>
    </TableRow>
  );
}

function ExpandedTableRows() {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          onClick={(e) => {
            e.stopPropagation();
          }}
          icon={<CollectionsBookMarkIcon fontSize="medium" />}
          checkedIcon={<CollectionsBookMarkIcon fontSize="medium" />}
        />
      </TableCell>
      <TableCell>
        <Typography variant="body1">23429</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body1">CS</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body1">1200</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body1">007</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body1">MW 4:00-5:15pm ECSS 2.412</Typography>
      </TableCell>
    </TableRow>
  );
}

type PlannerCardProps = {
  prefix: string;
  number: string;
  profFirst: string;
  profLast: string;
  numSections: number;
  onBookmarkClick: () => void;
};

const PlannerCard = ({
  prefix,
  number,
  profFirst,
  profLast,
  numSections,
  onBookmarkClick,
}: PlannerCardProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{
        width: 550,
        height: open ? 80 + numSections * 85 : 80,
        border: 2,
        borderRadius: 6,
        bgcolor: '#f9f9f9',
        borderColor: '#5f3fd3',
        display: 'flex',
        alignItems: 'center',

        overflow: 'hidden',
      }}
      onClick={() => setOpen(!open)}
    >
      <Grid2
        container
        spacing={1}
        alignItems="center"
        sx={{ width: '100%', pt: open ? 2 : 0 }}
      >
        <Grid2 sx={{ pl: 2 }}>
          <IconButton
            size="medium"
            sx={{
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          >
            <KeyboardArrowIcon fontSize="inherit" />
          </IconButton>
        </Grid2>

        <Grid2>
          <Checkbox
            defaultChecked
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkClick();
            }}
            icon={
              <BookMarkIcon style={{ color: '#553dff' }} fontSize="medium" />
            }
            checkedIcon={<BookMarkIcon fontSize="medium" />}
          />
        </Grid2>

        <Grid2>
          <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200 cursor-text w-fit">
            {`${prefix} ${number} ${profFirst} ${profLast}`}
          </Typography>
        </Grid2>

        <Collapse in={open} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ height: 15 }}>
                {numSections !== 0 ? <ExpandedTableHead /> : <></>}
              </TableHead>
              <TableBody>
                {Array(numSections)
                  .fill(0)
                  .map((_, index) => {
                    return <ExpandedTableRows key={index} />;
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </Grid2>
    </Box>
  );
};

export default PlannerCard;
