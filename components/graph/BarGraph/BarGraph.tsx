import { useMediaQuery } from '@mui/material';
import React from 'react';

import GraphProps from '../../../modules/GraphProps/GraphProps';
import { HorizontalBarGraph } from '../HorizontalBarGraph/HorizontalBarGraph';
import { VerticalBarGraph } from '../VerticalBarGraph/VerticalBarGraph';

/**
 * The purpose of this component is to offer an automatically responsive bar chart feature. It simply returns a `VerticalBarGraph` or a `HorizontalBarGraph`
 *  (you can read about these components below) based on screen width.
 * When the width of a screen gets below 600px, the
 * component returns a `HorizontalBarGraph` instead of a `VerticalBarGraph`.
 * @param props
 * @returns bar graph component
 */
export function BarGraph(props: GraphProps) {
  const smallScreen = useMediaQuery('(min-width:600px)');
  if (smallScreen) {
    return <VerticalBarGraph {...props} />;
  }
  return <HorizontalBarGraph {...props} />;
}
