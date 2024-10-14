# SingleGradesInfo

This component is used to display UTDGrades chart data in the expanded view of a professor's class's listing. It displays above the SingleProfInfo that also displays when a search result is expanded.

Creates `course` prop from the user's search query and `grades` prop from the UTDGrades api results to compile all the data and display it in a chart.


## Props Table

| Prop | Type     | Description                                       |
| :-------- | :------- |:--------------------------------------------------|
| `course` | `SearchQuery` | Used to narrow down UTDGrades data to the searched course(s) from a professor's results. |
| `grades` | `GenericFetchedData<GradesType>` | Compiles all the data from all the different sections and semesters of data relating tot he searched course(s) |


## Usage/Examples

```typescript jsx
<TableRow>
  <TableCell className="p-0" colSpan={6}>
    <Collapse in={open} timeout="auto" unmountOnExit>
      <div className="p-2 md:p-4 flex flex-col gap-2">
        <SingleGradesInfo course={course} grades={grades} /> //SingleGradesInfo
        <SingleProfInfo rmp={rmp} />
      </div>
    </Collapse>
  </TableCell>
</TableRow>
```