This component allows data from the Nebula API (RateMyProfessor data) to be displayed for each course and/or professor. Specifically, it shows the professor's rating, the number of ratings given for the professor, the difficulty of the professor's classes, the percentage of people who would take the professor again, and some common tags for the course.

### Props Table

| Prop  | Type                      | Description                                          | Required |
| :---- | :------------------------ | :--------------------------------------------------- | -------- |
| `rmp` | `GenericFetchedData<RMP>` | The RateMyProfessorData that is fetched from the API | Yes      |

### SingleProfInfo Example
