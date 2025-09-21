This component is used only in the carousel.

### Props Table

| Prop          | Type              | Description                                                 | Required |
| :---------    | :---------------- | :---------------------------------------------------------- | -------- |
| value         | number            | The index of the current tab | Yes      |
| options       | array of strings   | Labels for each tab in the carousel, where each entry in the array is the text label for a tab | Yes      |
| turner        | number            | Function provided by the parent to animate/shift the carousel when the tab is changed, function must accept a signed number that tells the magnitude and direction the carousel should move | Yes      |
| compareLength | number            | When rendering the last tab, if compareLength is non-zero, the component shows a badge with this number next to the label | Yes      |
| open          | boolean           | Controls the open/closed state | Yes      |
| setOpen       | boolean           | Function to set the open boolean in the parent component, function must accept a boolean and updates parent state | Yes      |

### TabNavMenu Example

```tsx

const compare = [];

const turner = (displacement) => {
  // parent would update index and optionally animate
  console.log('turn by', displacement);
};

<TabNavMenu
  value={0}
  options={['Option 1', 'Option 2', 'Option 3', 'Option 4']}
  turner={turner}
  compareLength={compare.length}
  open={true}
  setOpen={(v) => console.log('setOpen', v)}
/>

```
