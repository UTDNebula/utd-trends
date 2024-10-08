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
  '#79ff57',
  '#92ff57',
  '#abff57',
  '#c4ff57',
  '#ddff57',
  '#f7ff57',
  '#ffee57',
  '#ffd557',
  '#ffbc57',
  '#ffa357',
  '#ff8957',
  '#ff7057',
  '#ff5757',
  '#b8b8b8',
];

export function useRainbowColors() {
  return useMediaQuery('(prefers-color-scheme: dark)')
    ? rainbowColors_dark
    : rainbowColors_light;
}
