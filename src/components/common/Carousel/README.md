
# Carousel

This component allows for navigation between different HTML elements. Trends implements it to display the course overview and compare tabs.

It uses the `framer-motion` library to provide sliding carousel animations when transitioning between different elements. The direction of movement is determined by the `turn` function.


## Props Table

| Prop       | Type                                 | Description                                          |
|:-----------|:-------------------------------------|:-----------------------------------------------------|
| `names`    | `string, string[]`                   | The name(s) of the children element(s)               |
| `children` | `ReactJSXElement, ReactJSXElement[]` | The element(s) that will be rendered in the carousel |


## Usage/Examples

```typescript jsx
<Carousel names={["Overview","Compare"]}>
  <div>This is the overview tab!</div>
  <div>This is the compare tab!</div>
</Carousel>
```
