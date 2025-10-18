This component is used in the page that shows search results. It is located directly under the navigation bar. It does not have any props. It reads semesters and chosen semester state from a shared provider and shows a lightweight LoadingFilters layout until client hydration completes to avoid SSR/hydration mismatches. Filter values are initialized from the URL query string and any change updates the URL in place using window.history.replaceState so the page does not navigate. The semester multi-select computes a recent-semesters list (up to four recent long semesters) based on the current date and uses compare/display helpers to sort and format semester labels.

### Filters Example

```jsx
import React, { useState } from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';

function MockFilters() {
  const [minGPA, setMinGPA] = useState('');
  const [minRating, setMinRating] = useState('');
  const semesters = ['2024 Fall', '2024 Spring', '2023 Fall', '2023 Spring'];
  const [chosen, setChosen] = useState([semesters[0]]);
  const [teachingNext, setTeachingNext] = useState(false);

  return (
    <Grid container spacing={2} className="mb-4 sm:m-0">
      <Grid item xs={6} sm={3} className="px-2">
        <FormControl fullWidth size="small">
          <InputLabel>Min GPA</InputLabel>
          <Select
            value={minGPA}
            label="Min GPA"
            onChange={(e) => setMinGPA(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="3.67">A-</MenuItem>
            <MenuItem value="3.33">B+</MenuItem>
            <MenuItem value="3.0">B</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6} sm={3} className="px-2">
        <FormControl fullWidth size="small">
          <InputLabel>Min Rating</InputLabel>
          <Select
            value={minRating}
            label="Min Rating"
            onChange={(e) => setMinRating(e.target.value)}
          >
            <MenuItem value="">
              <em>Any</em>
            </MenuItem>
            <MenuItem value="4.5">4.5+</MenuItem>
            <MenuItem value="4">4+</MenuItem>
            <MenuItem value="3">3+</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6} sm={3} className="px-2">
        <FormControl fullWidth size="small">
          <InputLabel>Semesters</InputLabel>
          <Select
            multiple
            value={chosen}
            renderValue={(selected) => selected.join(', ')}
            onChange={(e) =>
              setChosen(
                typeof e.target.value === 'string'
                  ? e.target.value.split(',')
                  : e.target.value,
              )
            }
          >
            {semesters.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={6} sm={3} className="px-2">
        <FormControlLabel
          control={
            <Switch
              checked={teachingNext}
              onChange={(e) => setTeachingNext(e.target.checked)}
            />
          }
          label="Teaching Next Semester"
        />
      </Grid>
    </Grid>
  );
}

<MockFilters />;
```
