Split component to make a draggable left and right side. It divides the page into two sides: LHS and RHS. (The RHS typically shows the overall data for a course/ professor and the LHS typically shows the breakdowns for search criteria. )

### Props Table

| Prop          | Type              | Description                                                      | Required |
| :------------ | :---------------- | :--------------------------------------------------------------- | -------- |
| `left`        | `React.ReactNode` | The rendered content shown in the LHS, can accept any React node | Yes      |
| `right`       | `React.ReactNode` | The rendered content shown in the RHS, can accept any React node | Yes      |
| `minLeft`     | `number`          | Minimum size of the LHS                                          | Yes      |
| `minRight`    | `number`          | Minimum size of the RHS                                          | Yes      |
| `defaultLeft` | `number`          | Default size of the LHS                                          | Yes      |

### Split Example

```jsx

```
