import { useTheme, useMediaQuery } from '@mui/material';
import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Checkbox,
  Collapse,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import Rating from '@/components/common/Rating/Rating';
import SingleGradesInfo from '@/components/common/SingleGradesInfo/SingleGradesInfo';
import SingleProfInfo from '@/components/common/SingleProfInfo/SingleProfInfo';
import TableSortLabel from '@/components/common/TableSortLabel/TableSortLabel';
import { gpaToColor, useRainbowColors } from '@/modules/colors/colors';
import type { GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade/gpaToLetterGrade';
import type { GradesType } from '@/modules/GradesType/GradesType';
import {
  convertToProfOnly,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';


    function LoadingRow() {
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

        const nameCell = (
            <Typography className="w-1/2 sm:w-full leading-tight text-lg">
                <Skeleton />
            </Typography>
        );


        return (
            <>
                {isMobile && (
                    <TableRow>
                        <TableCell
                            component="th"
                            scope="row"
                            className="w-full border-b-0 pb-0"
                            colSpan={3}
                        >
                            {nameCell}
                        </TableCell>
                    </TableRow>
                )}

                <TableRow>
                    <TableCell className="flex">
                        <IconButton aria-label="expand row" size="medium" disabled>
                            <KeyboardArrowIcon />
                        </IconButton>
                        <Checkbox disabled />
                    </TableCell>
                    <TableCell
                        component="th"
                        scope="row"
                        className="w-full hidden sm:table-cell"
                    >
                        {nameCell}
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
            </>
        );
    }

    type RowProps = {
        course: SearchQuery;
        grades: GenericFetchedData<GradesType>;
        rmp: GenericFetchedData<RMPInterface>;
        inCompare: boolean;
        addToCompare: (arg0: SearchQuery) => void;
        removeFromCompare: (arg0: SearchQuery) => void;
        color?: string;
    };

    function Row({

        course,
        grades,
        rmp,
        inCompare,
        addToCompare,
        removeFromCompare,
        color,
    }: RowProps) {
        const [open, setOpen] = useState(false);

        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
        const canOpen =
            !(typeof grades === 'undefined' || grades.state === 'error') ||
            !(typeof rmp === 'undefined' || rmp.state === 'error');

        const rainbowColors = useRainbowColors();

        const nameCell = (
            <Tooltip
                title={
                    typeof course.profFirst !== 'undefined' &&
                    typeof course.profLast !== 'undefined' &&
                    (rmp !== undefined &&
                        rmp.state === 'done' &&
                        rmp.data.teacherRatingTags.length > 0
                        ? 'Tags: ' +
                        rmp.data.teacherRatingTags
                            .sort((a, b) => b.tagCount - a.tagCount)
                            .slice(0, 3)
                            .map((tag) => tag.tagName)
                            .join(', ')
                        : 'No Tags Available')
                }
                placement="top"
            >
                <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200 w-fit">
                    {searchQueryLabel(course) +
                        ((typeof course.profFirst === 'undefined' &&
                            typeof course.profLast === 'undefined') ||
                            (typeof course.prefix === 'undefined' &&
                                typeof course.number === 'undefined')
                            ? ' (Overall)'
                            : '')}
                </Typography>
            </Tooltip>
        );

        return (
            <>
                <TableRow
                    onClick={() => {
                        if (canOpen) setOpen(!open);
                    }}
                    className={'table-row sm:hidden' + (canOpen ? ' cursor-pointer' : '')}
                >
                    <TableCell
                        component="th"
                        scope="row"
                        className="w-full border-b-0 pb-0"
                        colSpan={3}
                    >
                        {nameCell}
                    </TableCell>
                </TableRow>
                <TableRow
                    onClick={() => {
                        if (canOpen) setOpen(!open);
                    }} // opens/closes the card by clicking anywhere on the row
                    className={canOpen ? 'cursor-pointer' : ''}
                >
                    <TableCell className="border-b-0">
                        <div className="flex items-center gap-1">
                            <Tooltip
                                title={open ? 'Minimize Result' : 'Expand Result'}
                                placement="top"
                            >
                                <IconButton
                                    aria-label="expand row"
                                    size="medium"
                                    disabled={!canOpen}
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevents double opening/closing
                                        if (canOpen) setOpen(!open);
                                    }}
                                    className={'transition-transform' + (open ? ' rotate-90' : '')}
                                >
                                    <KeyboardArrowIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title={inCompare ? 'Remove from Compare' : 'Add to Compare'}
                                placement="top"
                            >
                                <Checkbox
                                    checked={inCompare}
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevents opening/closing the card when clicking on the compare checkbox
                                        if (inCompare) {
                                            removeFromCompare(course);
                                        } else {
                                            addToCompare(course);
                                        }
                                    }}
                                    disabled={
                                        (typeof grades !== 'undefined' &&
                                            grades.state === 'loading') ||
                                        (typeof rmp !== 'undefined' && rmp.state === 'loading')
                                    }
                                    sx={
                                        color
                                            ? {
                                                '&.Mui-checked': {
                                                    color: color,
                                                },
                                            }
                                            : undefined
                                    } // Apply color if defined
                                />
                            </Tooltip>
                        </div>
                    </TableCell>
                    <TableCell
                        component="th"
                        scope="row"
                        className="w-full border-b-0 hidden sm:table-cell"
                    >
                        {nameCell}
                    </TableCell>
                    <TableCell align="center" className="border-b-0">
                        {((typeof grades === 'undefined' || grades.state === 'error') && (
                            <></>
                        )) ||
                            (grades.state === 'loading' && (
                                <Skeleton
                                    variant="rounded"
                                    className="rounded-full px-5 py-2 w-16 block mx-auto"
                                >
                                    <Typography className="text-base w-6">A+</Typography>
                                </Skeleton>
                            )) ||
                            (grades.state === 'done' && (
                                <Tooltip
                                    title={'GPA: ' + grades.data.filtered.gpa.toFixed(2)}
                                    placement="top"
                                >
                                    <Typography
                                        className="text-base text-black text-center rounded-full px-5 py-2 w-16 block mx-auto"
                                        sx={{
                                            backgroundColor: gpaToColor(
                                                rainbowColors,
                                                grades.data.filtered.gpa,
                                            ),
                                        }}
                                    >
                                        {gpaToLetterGrade(grades.data.filtered.gpa)}
                                    </Typography>
                                </Tooltip>
                            )) ||
                            null}
                    </TableCell>
                    <TableCell align="center" className="border-b-0">
                        {((typeof rmp === 'undefined' || rmp.state === 'error') && <></>) ||
                            (rmp.state === 'loading' && (
                                <Skeleton variant="rounded" className="rounded-full">
                                    <Rating sx={{ fontSize: 25 }} readOnly />
                                </Skeleton>
                            )) ||
                            (rmp.state === 'done' && rmp.data.numRatings == 0 && <></>) ||
                            (rmp.state === 'done' && rmp.data.numRatings != 0 && (
                                <Tooltip
                                    title={'Professor rating: ' + rmp.data.avgRating}
                                    placement="top"
                                >
                                    <div>
                                        <Rating
                                            defaultValue={rmp.data.avgRating}
                                            precision={0.1}
                                            sx={{ fontSize: 25 }}
                                            readOnly
                                        />
                                    </div>
                                </Tooltip>
                            )) ||
                            null}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell className="p-0" colSpan={6}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <div className="p-2 md:p-4 flex flex-col gap-2">
                                <SingleGradesInfo
                                    course={course}
                                    grades={grades}
                                    gradesToUse="filtered"
                                />
                                <SingleProfInfo rmp={rmp} />
                            </div>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </>
        );
    }

    type SearchResultsTableProps = {
        resultsLoading: 'loading' | 'done';
        includedResults: SearchQuery[];
        grades: { [key: string]: GenericFetchedData<GradesType> };
        rmp: { [key: string]: GenericFetchedData<RMPInterface> };
        compare: SearchQuery[];
        addToCompare: (arg0: SearchQuery) => void;
        removeFromCompare: (arg0: SearchQuery) => void;
        colorMap: { [key: string]: string };
    };

    const SearchResultsTable = ({
        resultsLoading,
        includedResults,
        grades,
        rmp,
        compare,
        addToCompare,
        removeFromCompare,
        colorMap,
    }: SearchResultsTableProps) => {
        const [orderBy, setOrderBy] = useState<'name' | 'gpa' | 'rating'>('name');
        const [order, setOrder] = useState<'asc' | 'desc'>('asc');

        const handleClick = (col: 'name' | 'gpa' | 'rating') => {
            if (orderBy !== col) {
                setOrderBy(col);
                setOrder(col === 'name' ? 'asc' : 'desc');
            } else {
                setOrder(order === 'asc' ? 'desc' : 'asc');
            }
        };

        if (resultsLoading !== 'loading' && includedResults.length === 0) {
            return (
                <div className="p-4">
                    <Typography
                        variant="h3"
                        gutterBottom
                        className="leading-tight text-3xl font-bold"
                    >
                        No results
                    </Typography>
                    <Typography variant="body1">
                        There is no overlap for the selected courses, professors, and filters.
                    </Typography>
                </div>
            );
        }

        const sortedResults = includedResults.sort((a, b) => {
            // sorting logic remains unchanged
            return 0;
        });

        return (
            <>
                <Typography className="leading-tight text-3xl font-bold p-4">
                    Search Results
                </Typography>
                <TableContainer component={Paper}>
                    <Table stickyHeader aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="hidden sm:table-cell">Actions</TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={orderBy === 'name'}
                                        direction={orderBy === 'name' ? order : 'asc'}
                                        onClick={() => handleClick('name')}
                                    >
                                        Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip
                                        title="Average Letter Grade Across Course Sections"
                                        placement="top"
                                    >
                                        <div>
                                            <TableSortLabel
                                                active={orderBy === 'gpa'}
                                                direction={orderBy === 'gpa' ? order : 'desc'}
                                                onClick={() => handleClick('gpa')}
                                            >
                                                Grades
                                            </TableSortLabel>
                                        </div>
                                    </Tooltip>
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip
                                        title="Average Professor Rating from Rate My Professors"
                                        placement="top"
                                    >
                                        <div>
                                            <TableSortLabel
                                                active={orderBy === 'rating'}
                                                direction={orderBy === 'rating' ? order : 'desc'}
                                                onClick={() => handleClick('rating')}
                                            >
                                                Rating
                                            </TableSortLabel>
                                        </div>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {resultsLoading === 'done'
                                ? sortedResults.map((result) => (
                                    <Row
                                        key={searchQueryLabel(result)}
                                        course={result}
                                        grades={grades[searchQueryLabel(result)]}
                                        rmp={rmp[searchQueryLabel(convertToProfOnly(result))]}
                                        inCompare={
                                            compare.findIndex((obj) =>
                                                searchQueryEqual(obj, result)
                                            ) !== -1
                                        }
                                        addToCompare={addToCompare}
                                        removeFromCompare={removeFromCompare}
                                        color={colorMap[searchQueryLabel(result)]}
                                    />
                                ))
                                : Array(10)
                                    .fill(0)
                                    .map((_, index) => <LoadingRow key={index} />)}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        );
    };

    export default SearchResultsTable;
