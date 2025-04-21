This component renders a detailed overview of a course including information like title, description, requisites, grade data, etc.
It fetches course data from the Nebula API and uses the `parseDescription` function to parse and format key information to be displayed.

## Prop Table

| Parameter | Type                         | Description                                                               |
| :-------- | :--------------------------- | :------------------------------------------------------------------------ |
| `course`  | `searchQuery`                | An object derived from a search query that holds basic course information |
| `grades`  | `GenericFetchedData<Grades>` | A structure that holds grade data associated with `course`                |

## Course Overview Example

```tsx

```
