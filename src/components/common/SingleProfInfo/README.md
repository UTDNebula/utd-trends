This component is to import various pieces of information from a professor's RateMyProfessor profile. It uses the `GenericFetchedData` type to grab directly from the website and then format it to fit into UTD Trends.

### Props Table

| Prop  | Type                      | Description                                                                                                                                                                                                      | Required |
| :---- | :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `rmp` | `GenericFetchedData<RMP>` | A variable with multiple data points from a professor's RateMyProfessor profile, such as the number of students rated, the average ratings, and what percentage of students who rated would take the class again | Yes      |

### Single Prof Info Example

```jsx
const mockRMP = {
  id: '',
  legacyId: '',
  firstName: 'Professor',
  lastName: 'Lastname',
  school: {
    id: '',
    name: '',
  },
  department: '',
  avgRating: 4.5,
  numRatings: 100,
  avgDifficulty: 3.8,
  wouldTakeAgainPercent: 68,
  teacherRatingTags: [],
  ratingsDistribution: {
    r1: 10,
    r2: 30,
    r3: 20,
    r4: 5,
    r5: 5,
    total: 70,
  },
};

import SingleProfInfo from '@/components/common/SingleProfInfo/SingleProfInfo';

<SingleProfInfo rmp={mockRMP} />;
```
