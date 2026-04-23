import Rating from '@/components/common/Rating/Rating';
import {
  filterMinRatings,
  getRmpCounts,
  type FilterBarChipProps,
} from '@/modules/filters';
import { setParams } from '@/modules/searchParams';
import type { SearchResult } from '@/types/SearchQuery';
import { MenuItem, MenuList, Tooltip } from '@mui/material';
import FilterChip from '../FilterChip';

type MinRatingFilterChipProps = FilterBarChipProps<{
  chosenSectionTypes: string[];
  chosenSemesters: string[];
  minGPA: string;
  minRating: string;
  semFilteredResults: SearchResult[];
}>;

export default function MinRatingFilterChip({
  type,
  dirty,
  disableAutoDirty,
  data,
}: MinRatingFilterChipProps) {
  const { minRating } = data;

  const isDefault = !Boolean(minRating);
  if (type === 'delete' && isDefault) return;

  const rmpCounts: Record<string, number> = getRmpCounts(data);

  return (
    <Tooltip
      title="Minimum professor rating"
      placement="top"
      disableInteractive
    >
      <FilterChip
        action={type}
        onDelete={() => {
          setParams((params) => {
            params.delete('minRating');
          });
        }}
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
        dirty={dirty ?? (!disableAutoDirty && !isDefault)}
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
            {filterMinRatings.map((value) => (
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
