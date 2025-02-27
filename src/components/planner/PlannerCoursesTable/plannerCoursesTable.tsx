import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Checkbox,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';

import Rating from '@/components/common/Rating/rating';

function LoadingRow() {
  return (
    <TableRow>
      <TableCell className="flex gap-1">
        <IconButton aria-label="expand row" size="medium" disabled>
          <KeyboardArrowIcon />
        </IconButton>
        <Checkbox disabled />
      </TableCell>
      <TableCell component="th" scope="row" className="w-full">
        <Typography className="w-full leading-tight text-lg">
          <Skeleton />
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Skeleton
          variant="rounded"
          className="rounded-full px-5 py-2 min-w-16 block mx-auto"
        >
          <Typography className="text-base">A+</Typography>
        </Skeleton>
      </TableCell>
      <TableCell align="center">
        <Skeleton variant="rounded" className="rounded-full mx-auto">
          <Rating sx={{ fontSize: 25 }} readOnly />
        </Skeleton>
      </TableCell>
    </TableRow>
  );
}

// type RowProps = {
//   course: SearchQuery;
//   grades: GenericFetchedData<GradesType>;
//   rmp: GenericFetchedData<RMPInterface>;
//   inCompare: boolean;
//   addToCompare: (arg0: SearchQuery) => void;
//   removeFromCompare: (arg0: SearchQuery) => void;
//   color?: string;
// };

// function Row({
//   course,
//   grades,
//   rmp,
//   inCompare,
//   addToCompare,
//   removeFromCompare,
//   color,
// }: RowProps) {
//   const [open, setOpen] = useState(false);

//   const rainbowColors = useRainbowColors();
//   const gpaToColor = (gpa: number): string => {
//     if (gpa >= 4.0) return rainbowColors[1];
//     if (gpa >= 3.67) return rainbowColors[2];
//     if (gpa >= 3.33) return rainbowColors[3];
//     if (gpa >= 3.0) return rainbowColors[4];
//     if (gpa >= 2.67) return rainbowColors[5];
//     if (gpa >= 2.33) return rainbowColors[6];
//     if (gpa >= 2.0) return rainbowColors[7];
//     if (gpa >= 1.67) return rainbowColors[8];
//     if (gpa >= 1.33) return rainbowColors[9];
//     if (gpa >= 1.0) return rainbowColors[10];
//     if (gpa >= 0.67) return rainbowColors[11];
//     return rainbowColors[12];
//   };

//   return (
//     <>
//       <TableRow
//         onClick={() => setOpen(!open)} // opens/closes the card by clicking anywhere on the row
//         className="cursor-pointer"
//       >
//         <TableCell className="border-b-0">
//           <div className="flex items-center gap-1">
//             <Tooltip
//               title={open ? 'Minimize Result' : 'Expand Result'}
//               placement="top"
//             >
//               <IconButton
//                 aria-label="expand row"
//                 size="medium"
//                 onClick={(e) => {
//                   e.stopPropagation(); // prevents double opening/closing
//                   setOpen(!open);
//                 }}
//                 className={'transition-transform' + (open ? ' rotate-90' : '')}
//               >
//                 <KeyboardArrowIcon fontSize="inherit" />
//               </IconButton>
//             </Tooltip>
//             <Tooltip
//               title={inCompare ? 'Remove from Compare' : 'Add to Compare'}
//               placement="top"
//             >
//               <Checkbox
//                 checked={inCompare}
//                 onClick={(e) => {
//                   e.stopPropagation(); // prevents opening/closing the card when clicking on the compare checkbox
//                   if (inCompare) {
//                     removeFromCompare(course);
//                   } else {
//                     addToCompare(course);
//                   }
//                 }}
//                 disabled={
//                   (typeof grades !== 'undefined' &&
//                     grades.state === 'loading') ||
//                   (typeof rmp !== 'undefined' && rmp.state === 'loading')
//                 }
//                 sx={
//                   color
//                     ? {
//                         '&.Mui-checked': {
//                           color: color,
//                         },
//                       }
//                     : undefined
//                 } // Apply color if defined
//               />
//             </Tooltip>
//           </div>
//         </TableCell>
//         <TableCell component="th" scope="row" className="w-full border-b-0">
//           <Tooltip
//             title={
//               typeof course.profFirst !== 'undefined' &&
//               typeof course.profLast !== 'undefined' &&
//               (rmp !== undefined &&
//               rmp.state === 'done' &&
//               rmp.data.teacherRatingTags.length > 0
//                 ? 'Tags: ' +
//                   rmp.data.teacherRatingTags
//                     .sort((a, b) => b.tagCount - a.tagCount)
//                     .slice(0, 3)
//                     .map((tag) => tag.tagName)
//                     .join(', ')
//                 : 'No Tags Available')
//             }
//             placement="top"
//           >
//             <Typography
//               onClick={
//                 (e) => e.stopPropagation() // prevents opening/closing the card when clicking on the text
//               }
//               className="leading-tight text-lg text-gray-600 dark:text-gray-200 cursor-text w-fit"
//             >
//               {searchQueryLabel(course) +
//                 ((typeof course.profFirst === 'undefined' &&
//                   typeof course.profLast === 'undefined') ||
//                 (typeof course.prefix === 'undefined' &&
//                   typeof course.number === 'undefined')
//                   ? ' (Overall)'
//                   : '')}
//             </Typography>
//           </Tooltip>
//         </TableCell>
//         <TableCell align="center" className="border-b-0">
//           {((typeof grades === 'undefined' || grades.state === 'error') && (
//             <></>
//           )) ||
//             (grades.state === 'loading' && (
//               <Skeleton
//                 variant="rounded"
//                 className="rounded-full px-5 py-2 w-16 block mx-auto"
//               >
//                 <Typography className="text-base w-6">A+</Typography>
//               </Skeleton>
//             )) ||
//             (grades.state === 'done' && (
//               <Tooltip
//                 title={'GPA: ' + grades.data.gpa.toFixed(2)}
//                 placement="top"
//               >
//                 <Typography
//                   className="text-base text-black text-center rounded-full px-5 py-2 w-16 block mx-auto"
//                   sx={{ backgroundColor: gpaToColor(grades.data.gpa) }}
//                 >
//                   {gpaToLetterGrade(grades.data.gpa)}
//                 </Typography>
//               </Tooltip>
//             )) ||
//             null}
//         </TableCell>
//         <TableCell align="center" className="border-b-0">
//           {((typeof rmp === 'undefined' || rmp.state === 'error') && <></>) ||
//             (rmp.state === 'loading' && (
//               <Skeleton variant="rounded" className="rounded-full">
//                 <Rating sx={{ fontSize: 25 }} readOnly />
//               </Skeleton>
//             )) ||
//             (rmp.state === 'done' && rmp.data.numRatings == 0 && <></>) ||
//             (rmp.state === 'done' && rmp.data.numRatings != 0 && (
//               <Tooltip
//                 title={'Professor rating: ' + rmp.data.avgRating}
//                 placement="top"
//               >
//                 <div>
//                   <Rating
//                     defaultValue={rmp.data.avgRating}
//                     precision={0.1}
//                     sx={{ fontSize: 25 }}
//                     readOnly
//                   />
//                 </div>
//               </Tooltip>
//             )) ||
//             null}
//         </TableCell>
//       </TableRow>
//       <TableRow>
//         <TableCell className="p-0" colSpan={6}>
//           <Collapse in={open} timeout="auto" unmountOnExit>
//             <div className="p-2 md:p-4 flex flex-col gap-2">
//               <SingleGradesInfo course={course} grades={grades} />
//               <SingleProfInfo rmp={rmp} />
//             </div>
//           </Collapse>
//         </TableCell>
//       </TableRow>
//     </>
//   );
// }

type PlannerCoursesTableProps = {
  prop?: string;
};

const PlannerCoursesTable = ({ prop }: PlannerCoursesTableProps) => {
  console.log(prop ?? '');
  return (
    //TODO: sticky header
    <>
      <Typography className="leading-tight text-3xl font-bold p-4">
        My Planner
      </Typography>
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>Actions</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="center">Grades</TableCell>
              <TableCell align="center">Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array(10)
              .fill(0)
              .map((_, index) => (
                <LoadingRow key={index} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default PlannerCoursesTable;
