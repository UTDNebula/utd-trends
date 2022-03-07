import { useMediaQuery } from '@mui/material';
import { HorizontalBarGraph } from './HorizontalBarGraph';
import { VerticalBarGraph } from './VerticalBarGraph';

type GraphProps = {
  xaxisLabels: string[];
  series: any[];
  title: string;
};

export function BarGraph(props: GraphProps) {
  const smallScreen = useMediaQuery('(min-width:600px)');
  if (smallScreen) {
    return (
      <VerticalBarGraph
        xaxisLabels={props.xaxisLabels}
        series={props.series}
        title={props.title}
      />
    );
  }
  return (
    <HorizontalBarGraph
      xaxisLabels={props.xaxisLabels}
      series={props.series}
      title={props.title}
    />
  );
}
