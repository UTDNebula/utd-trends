# SingleProfInfo

This component is used to display RateMyProfessor data in the expanded view of a professor's class's listing. It displays right below the SingleGradesInfo that also displays when a search result is expanded.

Creates a `rmp` prop from the ratemyprofessorScraper results to compile all the data and display it in a grid.


## Props Table

| Prop | Type     | Description                                       |
| :-------- | :------- |:--------------------------------------------------|
| `rmp` | `GenericFetchedData, RateMyProfessorData` | Created to fetch Professor rating, Difficulty, Ratings given, and Would take again percentage.|


## Usage/Examples

```typescript jsx
<TableRow>
  <TableCell className="p-0" colSpan={6}>
    <Collapse in={open} timeout="auto" unmountOnExit>
      <div className="p-2 md:p-4 flex flex-col gap-2">
        <SingleGradesInfo course={course} grades={grades} />
        <SingleProfInfo rmp={rmp} /> //SingleProfInfo
      </div>
    </Collapse>
  </TableCell>
</TableRow>
```