import Rating from '@/components/common/Rating/Rating';
import FilterPanel from '@/components/search/Filters/base/FilterPanel';
import {
  filterMinGPAs,
  filterMinRatings,
  getGradeCounts,
  getRmpCounts,
  type FilterModalPanelProps,
} from '@/modules/filters';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade';
import { setParams } from '@/modules/searchParams';
import type { SearchResult } from '@/types/SearchQuery';
import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';

type MinFilterPanelProps = FilterModalPanelProps<{
  chosenSectionTypes: string[];
  chosenSemesters: string[];
  minGPA: string;
  minRating: string;
  semesters: string[];
  semFilteredResults: SearchResult[];
  sectionTypes: string[];
}>;

export default function MinFilterPanel({ data }: MinFilterPanelProps) {
  const { minGPA, minRating } = data;

  const gradeCounts: Record<string, number> = getGradeCounts(data);
  const rmpCounts: Record<string, number> = getRmpCounts(data);

  return (
    <FilterPanel heading="Minimum" id="filter-minimum">
      <Grid container spacing={3} marginTop={1}>
        <FormControl size="small" className="w-full">
          <InputLabel id="minGPA">Letter Grade</InputLabel>
          <Select
            label="Letter Grade"
            labelId="minGPA"
            value={minGPA}
            slotProps={{
              root: {
                className: minGPA
                  ? 'bg-cornflower-50 dark:bg-cornflower-900'
                  : 'bg-white dark:bg-neutral-900',
              },
            }}
            onChange={(event: SelectChangeEvent) => {
              const newValue = event.target.value;
              setParams((params) => {
                if (newValue !== '') {
                  params.set('minGPA', newValue);
                } else {
                  params.delete('minGPA');
                }
              });
            }}
            renderValue={(value) => gpaToLetterGrade(Number(value))}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {filterMinGPAs.map((value) => (
              <MenuItem key={value} value={value}>
                <span className="w-5">{gpaToLetterGrade(Number(value))}</span>
                <span className="text-sm text-gray-400 ml-2">
                  ({gradeCounts[value] ?? 0})
                </span>
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Minimum course letter grade average</FormHelperText>
        </FormControl>

        <FormControl size="small" className="w-full">
          <InputLabel id="minRating">Rating</InputLabel>
          <Select
            label="Rating"
            labelId="minRating"
            value={minRating}
            slotProps={{
              root: {
                className: minRating
                  ? 'bg-cornflower-50 dark:bg-cornflower-900'
                  : 'bg-white dark:bg-neutral-900',
              },
            }}
            onChange={(event: SelectChangeEvent) => {
              const newValue = event.target.value;
              setParams((params) => {
                if (newValue !== '') {
                  params.set('minRating', newValue);
                } else {
                  params.delete('minRating');
                }
              });
            }}
            renderValue={(value) => (
              <Rating
                key={value}
                defaultValue={Number(value)}
                precision={0.5}
                sx={{ fontSize: 18 }}
                readOnly
              />
            )}
          >
            <MenuItem className="h-10" value="">
              <em>None</em>
            </MenuItem>
            {filterMinRatings.map((value) => (
              <MenuItem className="h-10" key={value} value={value}>
                <Rating
                  defaultValue={Number(value)}
                  precision={0.5}
                  sx={{ fontSize: 25 }}
                  readOnly
                />
                <span className="text-sm text-gray-400 ml-2">
                  ({rmpCounts[value] ?? 0})
                </span>
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Minimum professor rating</FormHelperText>
        </FormControl>
      </Grid>
    </FilterPanel>
  );
}
