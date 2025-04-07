import { useMediaQuery } from '@mui/material';

export const compareColors = [
  '#eb5757',
  '#2d9cdb',
  '#499F68',
  '#f2994a',
  '#9b51e0',
  '#f2c94c',
  '#1f78b4',
];

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

export function gpaToColor(colors: string[], gpa: number): string {
  if (gpa >= 4.0) return colors[1];
  if (gpa >= 3.67) return colors[2];
  if (gpa >= 3.33) return colors[3];
  if (gpa >= 3.0) return colors[4];
  if (gpa >= 2.67) return colors[5];
  if (gpa >= 2.33) return colors[6];
  if (gpa >= 2.0) return colors[7];
  if (gpa >= 1.67) return colors[8];
  if (gpa >= 1.33) return colors[9];
  if (gpa >= 1.0) return colors[10];
  if (gpa >= 0.67) return colors[11];
  return colors[12];
}

export const plannerColors = [
  { fill: '#FFA6C2', outline: '#FEC2D5', font: '#780909' },
  { fill: '#D4A6E2', outline: '#DEBDE8', font: '#590972' },
  { fill: '#93BDFF', outline: '#B1CFFF', font: '#0E397C' },
  { fill: '#F9C28A', outline: '#FFCDB7', font: '#611F00' },
  { fill: '#7BD6DD', outline: '#A2F4FA', font: '#034F55' },
  { fill: '#E9D0AC', outline: '#FFECD0', font: '#5D3804' },
  { fill: '#89EDAF', outline: '#B0FBCD', font: '#335600' },
  { fill: '#D3C1FB', outline: '#EEE6FF', font: '#483080' },
  { fill: '#9FF9C9', outline: '#BFFFDD', font: '#005025' },
];
