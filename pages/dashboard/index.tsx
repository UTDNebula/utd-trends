import { Card } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Carousel from '../../components/common/Carousel/carousel';
import { GraphChoice } from '../../components/graph/GraphChoice/GraphChoice';
import TopMenu from '../../components/navigation/topMenu/topMenu';
import { ExpandableSearchGrid } from '../../components/common/ExpandableSearchGrid/expandableSearchGrid';

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

  type datType = {
    name: string;
    data: number[];
  };
  const [dat, setDat] = useState<datType[]>([]);
  const [GPAdat, setGPADat] = useState<datType[]>([]);
  const [averageDat, setAverageDat] = useState<datType[]>([]);
  const [stdevDat, setStdevDat] = useState<datType[]>([]);
  function round(val: number) {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }
  const router = useRouter();
  const [state, setState] = useState('loading');

  useEffect(() => {
    fetch('/api/ratemyprofessorScraper?professors=Greg%20Ozbirn,John%20Cole', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  });

  useEffect(() => {
    setState('loading');
    if (!router.isReady) return;
    if (
      'sections' in router.query &&
      typeof router.query.sections === 'string'
    ) {
      Promise.all(
        router.query.sections.split(',').map((section) =>
          fetch('/api/nebulaAPI/section?id=' + section, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }).then((response) => response.json()),
        ),
      )
        .then((responses) => {
          setDat(
            responses.map((data) => {
              let newDat: datType = {
                name: data.data.name,
                data: data.data.grade_distribution,
              };
              return newDat;
            }),
          );

          let newGPADat: datType[] = [];
          let newAverageDat: datType[] = [];
          let newStdevDat: datType[] = [];
          for (let i = 0; i < responses.length; i++) {
            const GPALookup = [
              4, 4, 3.67, 3.33, 3, 2.67, 2.33, 2, 1.67, 1.33, 1, 0.67, 0,
            ];
            let GPAGrades: number[] = [];
            for (
              let j = 0;
              j < responses[i].data.grade_distribution.length - 1;
              j++
            ) {
              GPAGrades = GPAGrades.concat(
                Array(responses[i].data.grade_distribution[j]).fill(
                  GPALookup[j],
                ),
              );
            }
            newGPADat.push({ name: responses[i].data.name, data: GPAGrades });
            const mean =
              GPAGrades.reduce((partialSum, a) => partialSum + a, 0) /
              GPAGrades.length;
            newAverageDat.push({
              name: responses[i].data.name,
              data: [round(mean)],
            });
            const stdev = Math.sqrt(
              GPAGrades.reduce(
                (partialSum, a) => partialSum + (a - mean) ** 2,
                0,
              ) / GPAGrades.length,
            );
            newStdevDat.push({
              name: responses[i].data.name,
              data: [round(stdev)],
            });
          }
          setGPADat(newGPADat);
          setAverageDat(newAverageDat);
          setStdevDat(newStdevDat);

          setState('success');
        })
        .catch((error) => {
          setState('error');
          console.error('Nebula API Error', error);
        });
    }
  }, [router.isReady, router.query, router.query.sections]);

  if (state === 'error' || state === 'loading') {
    return (
      <>
        <div className=" w-full bg-light h-full">
          <TopMenu />
          <ExpandableSearchGrid />
          <div className="w-full h-5/6 justify-center">
            <div className="w-full h-5/6 relative min-h-full">
              <Carousel>
                <div className="h-full m-4 ">
                  <Card className="h-96 p-4 m-4"></Card>
                </div>
                <div className="p-4 h-full">
                  <Card className="h-96 p-4 m-4"></Card>
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <Card className="h-96 p-4 m-4"></Card>
                    <Card className="h-96 p-4 m-4"></Card>
                  </div>
                </div>
                <div className=" ">Hi</div>
              </Carousel>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className=" w-full bg-light h-full">
        <TopMenu />
        <ExpandableSearchGrid />
        <div className="w-full h-5/6 justify-center">
          <div className="w-full h-5/6 relative min-h-full">
            <Carousel>
              <div className="h-full m-4 ">
                <Card className="h-96 p-4 m-4">
                  <GraphChoice
                    form="Bar"
                    title="Grades"
                    xaxisLabels={[
                      'A+',
                      'A',
                      'A-',
                      'B+',
                      'B',
                      'B-',
                      'C+',
                      'C',
                      'C-',
                      'D+',
                      'D',
                      'D-',
                      'F',
                      'W',
                    ]}
                    series={dat}
                  />
                </Card>
              </div>
              <div className="p-4 h-full">
                <Card className="h-96 p-4 m-4">
                  <GraphChoice
                    form="BoxWhisker"
                    title="GPA Box and Whisker"
                    xaxisLabels={[
                      'A+',
                      'A',
                      'A-',
                      'B+',
                      'B',
                      'B-',
                      'C+',
                      'C',
                      'C-',
                      'D+',
                      'D',
                      'D-',
                      'F',
                      'W',
                    ]}
                    series={GPAdat}
                  />
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <Card className="h-96 p-4 m-4">
                    <GraphChoice
                      form="Bar"
                      title="GPA Averages"
                      xaxisLabels={['Average']}
                      series={averageDat}
                    />
                  </Card>
                  <Card className="h-96 p-4 m-4">
                    <GraphChoice
                      form="Bar"
                      title="GPA Standard Deviations"
                      xaxisLabels={['Standard Deviation']}
                      series={stdevDat}
                    />
                  </Card>
                </div>
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
