This component allows RateMyProfessor data to be displayed for each course and/or professor. Specifically, it shows the professor's rating, the number of ratings given for the professor, the difficulty of the professor's classes, the percentage of people who would take the professor again, and some common tags for the course.

### Props Table

| Prop  | Type                      | Description                                          | Required |
| :---- | :------------------------ | :--------------------------------------------------- | -------- |
| `rmp` | `GenericFetchedData<RMP>` | The RateMyProfessorData that is fetched from the API | Yes      |

### SingleProfInfo Example

```jsx
const sampleTag = ['Sample (1)'];

import { Chip, Collapse, Grid, IconButton, Skeleton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

<>
  <Grid container spacing={2} className="p-4">
    {/* Loading skeletons for each metric */}
    <Grid size={6}>
      <p className="text-xl font-bold">5.0</p>
      <p>Professor rating</p>
    </Grid>
    <Grid size={6}>
      <p className="text-xl font-bold">5.0</p>
      <p>Difficulty</p>
    </Grid>
    <Grid size={6}>
      <p className="text-xl font-bold">1,000</p>
      <p>Ratings given</p>
    </Grid>
    <Grid size={6}>
      <p className="text-xl font-bold">99%</p>
      <p>Would take again</p>
    </Grid>

    <Grid size={12}>
      <div className="flex gap-1 flex-wrap">
        <Chip label={sampleTag[0]} />
        <IconButton size="small">
          <ExpandMoreIcon />
        </IconButton>
      </div>
    </Grid>

    <Grid size={12}>
      <a
        className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
        href="https://github.com/UTDNebula/utd-trends"
      >
        Visit Rate My Professors
      </a>
    </Grid>
  </Grid>
</>;
```
