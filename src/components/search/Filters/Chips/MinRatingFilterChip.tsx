import Rating from '@/components/common/Rating/Rating';
import { calculateGrades } from '@/modules/fetchGrades';
import { setParams } from '@/modules/searchParams';
import type { SearchResult } from '@/types/SearchQuery';
import { MenuItem, MenuList, Tooltip } from '@mui/material';
import FilterChip from '../FilterChip';

type MinRatingFilterChipProps = {
  chosenSectionTypes: string[];
  chosenSemesters: string[];
  minGPA: string;
  minRating: string;
  semFilteredResults: SearchResult[];
};

const minRatings = ['4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1', '0.5'];

export default function MinRatingFilterChip({
  chosenSectionTypes,
  chosenSemesters,
  minGPA,
  minRating,
  semFilteredResults,
}: MinRatingFilterChipProps) {
  const rmpCounts: Record<string, number> = {};

  minRatings.forEach((ratingString) => {
    const ratingNum = parseFloat(ratingString);
    rmpCounts[ratingString] = semFilteredResults.filter((result) => {
      // gpa filter
      const calculated = calculateGrades(
        result.grades,
        chosenSemesters,
        chosenSectionTypes,
      );
      if (typeof minGPA === 'string' && calculated.gpa < parseFloat(minGPA))
        return false;
      if (
        typeof ratingNum === 'number' &&
        result.type !== 'course' &&
        result.RMP &&
        result.RMP.avgRating < ratingNum
      )
        return false;
      return true;
    }).length;
  });

  return (
    <Tooltip title="Minimum professor rating" placement="top">
      <FilterChip
        label="Min Rating"
        renderValue={
          minRating ? (
            <Rating
              key={minRating}
              defaultValue={Number(minRating)}
              precision={0.5}
              sx={{ fontSize: 18 }}
              readOnly
            />
          ) : undefined
        }
        dirty={Boolean(minRating)}
      >
        {(ctx) => (
          <MenuList autoFocusItem={ctx.open}>
            <MenuItem
              className="h-10"
              value=""
              selected={minRating === ''}
              aria-selected={minRating === ''}
              onClick={() => {
                setParams((params) => {
                  params.delete('minRating');
                });
                ctx.closePopover();
              }}
            >
              <em className="italic">None</em>
            </MenuItem>
            {minRatings.map((value) => (
              <MenuItem
                className="h-10"
                key={value}
                value={value}
                selected={minRating === value}
                aria-selected={minRating === value}
                onClick={() => {
                  setParams((params) => {
                    params.set('minRating', value);
                  });
                  ctx.closePopover();
                }}
              >
                <Rating
                  defaultValue={Number(value)}
                  precision={0.5}
                  sx={{ fontSize: 25 }}
                  readOnly
                />{' '}
                <span className="text-sm text-gray-400 ml-2">
                  ({rmpCounts[value] ?? 0})
                </span>
              </MenuItem>
            ))}
          </MenuList>
        )}
      </FilterChip>
    </Tooltip>
  );
}
