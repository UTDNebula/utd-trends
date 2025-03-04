This component allows for navigation between different HTML elements. Trends implements it to display the course overview and compare tabs.
It uses the `framer-motion` library to provide sliding carousel animations when transitioning between different elements. The direction of movement is determined by the `turn` function.

### Props Table

| Prop            | Type                                 | Description                                                    | Required |
| :-------------- | :----------------------------------- | :------------------------------------------------------------- | -------- |
| `names`         | `string, string[]`                   | The name(s) of the children element(s)                         | Yes      |
| `children`      | `ReactJSXElement, ReactJSXElement[]` | The element(s) that will be rendered in the carousel           | Yes      |
| `compareLength` | `number`                             | The number of element(s) that will be rendered in the carousel | Yes      |

### Carousel Example

```tsx
<Carousel names = { ['Tab 1', 'Tab 2']}>
    <div > Content for Tab 1 < /div>
    <div>Content for Tab 2</div>
</Carousel>
```

```tsx
<Carousel names={['Tab 1', 'Tab 2']} compareLength={1}>
  <div>Content for Tab 1</div>
  <div>Content for Tab 2</div>
</Carousel>
```
