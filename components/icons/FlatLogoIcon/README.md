### Flat Logo Examples

The benefit of using a component for a flat icon like this is that it can be
styled using the surrounding div. The default icon looks like this

```ts
<div style={{ width: '25px' }}>
  <FlatLogoIcon />
</div>
```

But we can style it to be any color using the text color of a surrounding div

```ts
<div style={{ color: 'var(--lm-primary-dark)', width: '25px' }}>
  <FlatLogoIcon />
</div>
```
