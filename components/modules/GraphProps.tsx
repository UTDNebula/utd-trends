type GraphProps = {
    form?: 'Bar' | 'Line' | 'Radar' | 'Vertical' | 'Horizontal' |'Radial';
    xaxisLabels?: string[];
    series: any[];
    title: string;
    labels?: string[]
  };
export default GraphProps;