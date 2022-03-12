type GraphProps = {
    form?: 'Bar' | 'Line' | 'Radar' | 'Radial';
    xaxisLabels?: string[];
    series: any[];
    title: string;
    labels?: string[]
  };
export default GraphProps;