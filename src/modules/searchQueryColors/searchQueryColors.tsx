import { useMediaQuery } from '@mui/material';

const searchQueryColors = [
  '#eb5757',
  '#2d9cdb',
  '#499F68',
  '#f2994a',
  '#9b51e0',
  '#f2c94c',
  '#1f78b4',
];
export default searchQueryColors;

const rainbowColors_dark = [
  '#9eff83',
  '#a6ff83',
  '#b4ff83',
  '#c6ff83',
  '#d4ff83',
  '#f0ff83',
  '#fff283',
  '#ffe083',
  '#ffce83',
  '#ffb883',
  '#ffa383',
  '#ff8f83',
  '#ff8383',
  '#d3d3d3',
];

const rainbowColors_light = [
  '#31f400',
  '#56f400',
  '#7af400',
  '#9ef400',
  '#c3f400',
  '#e8f400',
  '#f4db00',
  '#f4b700',
  '#f49300',
  '#ffa357',
  '#f44900',
  '#f42400',
  '#f40000',
  '#878787',
];

export function useRainbowColors() {
  return useMediaQuery('(prefers-color-scheme: dark)')
    ? rainbowColors_dark
    : rainbowColors_light;
}
