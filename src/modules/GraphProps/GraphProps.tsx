/**
 * Graph props
 * Form specifies the type of graph for the GraphChoice component
 * labels is only needed for the radial bar component
 */
type GraphProps = {
  xaxisLabels?: string[];
  yaxisFormatter?: (val: number) => string;
  series: any[];
  title: string;
  labels?: string[];
  includedColors?: boolean[];
};
export default GraphProps;
