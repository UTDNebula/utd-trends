type GraphProps = {
    form?: 'Bar' | 'Line' | 'Radar' | 'Radial';
    xaxisLabels?: string[];
    series: any[];
    title: string;
    dataLabels?: string[];
  };
export default GraphProps;