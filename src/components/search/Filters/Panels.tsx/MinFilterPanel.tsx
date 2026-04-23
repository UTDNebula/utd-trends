import Rating from '@/components/common/Rating/Rating';
import { calculateGrades } from '@/modules/fetchGrades';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade';
import { setParams } from '@/modules/searchParams';
import type { SearchResult } from '@/types/SearchQuery';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import FilterPanel from '../FilterPanel';
import { type FilterModalPanelProps } from '../utils';

type MinFilterPanelProps = FilterModalPanelProps<{
  chosenSectionTypes: string[];
  chosenSemesters: string[];
  minGPA: string;
  minRating: string;
  semesters: string[];
  semFilteredResults: SearchResult[];
  sectionTypes: string[];
}>;

const minGPAs = ['3.67', '3.33', '3', '2.67', '2.33', '2'];
const minRatings = ['4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1', '0.5'];

export default function MinFilterPanel({
  data: {
    chosenSectionTypes,
    chosenSemesters,
    minGPA,
    minRating,
    sectionTypes,
    semFilteredResults,
    semesters,
  },
}: MinFilterPanelProps) {
  const gradeCounts: Record<string, number> = {};

  minGPAs.forEach((gpaString) => {
    const gpaNum = parseFloat(gpaString);
    gradeCounts[gpaString] = semFilteredResults.filter((result) => {
      if (result.type !== 'course') {
        if (
          typeof minRating === 'string' &&
          result.RMP &&
          result.RMP.avgRating < parseFloat(minRating)
        )
          return false;
      }
      const courseGrades = result.grades;
      return (
        (courseGrades &&
          calculateGrades(courseGrades, chosenSemesters, chosenSectionTypes)
            .gpa >= gpaNum) ||
        (courseGrades === undefined &&
          chosenSemesters.length === semesters.length &&
          chosenSectionTypes.length === sectionTypes.length)
      );
    }).length;
  });

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
    <FilterPanel heading="Minimum">
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
          {minGPAs.map((value) => (
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
          {minRatings.map((value) => (
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
    </FilterPanel>
  );
}
