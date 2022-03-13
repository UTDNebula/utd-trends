import { Autocomplete, Input, Card } from '@mui/material';
import type { NextPage } from 'next';
import { ReactNode, useState } from 'react';
import Carousel from '../../components/common/carousel';
import { SearchBar } from '../../components/common/searchBar';
import { BarGraph } from '../../components/graph/BarGraph';
import { GraphChoice } from '../../components/graph/GraphChoice';
import { LineGraph } from '../../components/graph/LineGraph';
import { RadarChart } from '../../components/graph/RadarChart';
import { RadialBarChart } from '../../components/graph/RadialBarChart';
import SearchGrid from '../../components/navigation/searchGrid';
import TopMenu from '../../components/navigation/topMenu';

export const Dashboard: NextPage = () => {
  var data1 = [1, 2, 8, 2, 1, 3, 4, 7, 9];
  var data2 = [1, 3, 7, 4, 6, 8, 2, 1, 6];
  var data3 = [4, 9, 1, 1, 5, 8, 5, 2, 8];
  var data4 = [5, 1, 7, 1, 7, 9, 6, 2, 5];
  var data5 = [1, 2, 7, 1, 4, 6, 7, 3, 2];
  var data6 = [5, 5, 5, 1, 5, 1, 5, 1, 2];
  const [dataset1, setDataSet1] = useState<number[] | undefined>(data1);
  const [datalabel1, setDataLabel1] = useState('data1');
  const [dataset2, setDataSet2] = useState<number[] | undefined>(data2);
  const [datalabel2, setDataLabel2] = useState('data2');
  const [dataset3, setDataSet3] = useState<number[] | undefined>(data3);
  const [datalabel3, setDataLabel3] = useState('data3');
  const [st, setSt] = useState(true);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [search3, setSearch3] = useState('');

  function swap() {
    if (st) {
      setDataSet1(data4);
      setDataSet2(data5);
      setDataSet3(data6);
      setSt(false);
    } else {
      setDataSet1(undefined);
      setDataSet2(data2);
      setDataSet3(data3);
      setSt(true);
    }
  }

  function searchAutocomplete() {}

  var dat = [
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6,9] },
    { name: 'Suzy', data: [2, 5, 2, 1,1] },
  ];
  var diffDat = [31,87,65];

  return (
    <>
      <div className="h-full lg:h-screen w-full bg-light">
        <TopMenu />
        <SearchGrid></SearchGrid>
        <div className="w-full h-5/6 justify-center">
          <div className="w-full h-5/6 p-10 relative lg:min-h-full">
            <Carousel>
              <div className="grid grid-cols-2 gap-4 p-4 h-full lg:grid-cols-4 ">
                <Card className="row-span-4 col-span-2 p-4 h-screen lg:h-full">
                  <GraphChoice form='Radial' title='Grades Distribution' labels = {['Smith', 'Jason', 'Suzy']} series = {diffDat} ></GraphChoice>
                </Card>
                <Card className="col-span-2 row-span-4 lg:row-span-2 p-4 h-screen lg:h-full">
                  <GraphChoice form='Horizontal' title='Grades Distribution' xaxisLabels={['A','B','C','D','F','CR','NC']} series = {dat} ></GraphChoice>
                </Card>
                <Card className="col-span-2 row-span-4 lg:row-span-2 p-4 h-screen lg:h-full">
                  <GraphChoice form='Bar' title='Grades Distribution' xaxisLabels={['A','B','C','D','F','CR','NC']} series = {dat} ></GraphChoice>
                </Card>
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 h-full sm:grid-cols-2 md:grid-cols-4">
                <Card className="max-h-40">
                  <p>Average</p>
                  <p>3.1</p>
                </Card>
              </div>
              <div className=" ">Hi</div>
            </Carousel>
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;
