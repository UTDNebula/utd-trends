This component allows for navigation between different HTML elements. Trends implements it to display the course overview and compare tabs.
It uses the `framer-motion` library to provide sliding carousel animations when transitioning between different elements. The direction of movement is determined by the `turn` function.

### Props Table

| Prop       | Type              | Description                                                 | Required |
| :--------- | :---------------- | :---------------------------------------------------------- | -------- |
| `names`    | `React.ReactNode` | The name(s) of the tabs, can be strings or react components | Yes      |
| `children` | `React.ReactNode` | The element(s) that will be rendered in the carousel        | Yes      |

### Carousel Example

```tsx
import { useSharedState } from '@/app/SharedStateProvider';
const ShardStateSetter = () => {
  const { addToCompare } = useSharedState();
  React.useEffect(() => {
    addToCompare({ profFirst: 'John', profLast: 'Cole' });
  }, []);
  return null;
};
<>
  <ShardStateSetter />
  <Carousel names={['Tab 1', 'Tab 2']}>
    <div>Content for Tab 1</div>
    <div>Content for Tab 2</div>
  </Carousel>
</>;
```
