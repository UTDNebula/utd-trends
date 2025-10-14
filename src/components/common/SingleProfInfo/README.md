This component is to import various pieces of information from a professor's RateMyProfessor profile. It uses the `GenericFetchedData` type to grab directly from the website and then format it to fit into UTD Trends.

### Props Table
| Prop  | Type                      | Description | Required |
| :---- | :------------------------ | :--------------- | --------------- |
| `rmp` | `GenericFetchedData<RMP>` | A variable with multiple data points from a professor's RateMyProfessor profile, such as the number of students rated, the average ratings, and what percentage of students who rated would take the class again | Yes |

### Single Prof Info Example

```jsx
const sampleTag = ['Sample (1)'];

import { Chip, Grid, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

<>
  <Grid container spacing={2} className="p-4">
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