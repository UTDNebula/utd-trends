This component allows the display of the grades of a single course during a semester in a bar graph. You also have the ability to toggle this to a line graph.
The page will also display the total amount of grades, the median GPA, and the mean GPA.

### Props Table
| Prop         | Type                        | Description                                                                                    | Required |
| :----------- | :---------------------------| :----------------------------------------------------------------------------------------------| -------- |
|`title`       |`string`                     |The name of the class subject                                                                   | Yes      |
|`course`      |`SearchQuery`                |The official course code and number                                                             | Yes      |
|`grades`      |`GenericFetchedData<Grades>` |The total data of letter grades achieved by students in this class                              | Yes      |
|`gradesToUse` |`'filtered' \| 'unfiltered'` |The data of letter grades to use, possibly excluding certain terms (like summer or COVID terms) | Yes      |
