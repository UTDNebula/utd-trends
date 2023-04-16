/**
 * Graph props
 * Form specifies the type of graph for the GraphChoice component
 * labels is only needed for the radial bar component
 */
type GraphProps = {
  form?:
    | 'Bar'
    | 'Line'
    | 'Radar'
    | 'Vertical'
    | 'Horizontal'
    | 'Radial'
    | 'BoxWhisker';
  xaxisLabels?: string[];
  yaxisFormatter?: (val: number) => string;
  series: any[];
  title: string;
  subtitle?: string;
  labels?: string[];
};
export default GraphProps;
