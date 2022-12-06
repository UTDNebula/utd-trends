import { Card } from '@mui/material';
import type { NextPage } from 'next';
import { useState } from 'react';
import Carousel from '../../components/common/Carousel/carousel';
import { GraphChoice } from '../../components/graph/GraphChoice/GraphChoice';
import TopMenu from '../../components/navigation/topMenu/topMenu';
import { ExpandableSearchGrid } from '../../components/common/ExpandableSearchGrid/expandableSearchGrid';
import { getProfessorGradeList, setNebulaAPIKey } from './nebula.js';

export const Dashboard: NextPage = (props) => {
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
  
  let dat = [];
  let Boxdat = [
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },
  ];
  let radialData = [
    { name: 'Jason', data: [(3.1/4)*100]}, 
    { name: 'Kelly', data: [(2.6/4)*100]}, 
    { name: 'Smith', data: [(3.9/4)*100]}
  ];
  console.log(props.sections);
  if (props && props.sections) {
    for (const section of props.sections) {
      dat.push({name: section.section_number + ' ' + section.academic_session.name, data: section.grade_distribution});
    }
  }
  console.log(dat);

  return (
    <>
      <div className=" w-full bg-light h-full">
        <TopMenu />
        <ExpandableSearchGrid/>
        <div className="w-full h-5/6 justify-center">
          <div className="w-full h-5/6 relative min-h-full">
            <Carousel>
              <div className="h-full m-4 ">
                <Card className="h-96 p-4 m-4">
                  <GraphChoice
                    form="Bar"
                    title="Grades"
                    xaxisLabels={["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "W"]}
                    series={dat}
                  />
                </Card>
                <Card className="h-96 p-4 m-4">
                  <GraphChoice
                    form="Line"
                    title="Grades"
                    xaxisLabels={["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "W"]}
                    series={dat}
                  />
                </Card>
              </div>
              <div className="p-4 h-full">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <Card className="after:block m-4">
                  <GraphChoice
                      form="Radial"
                      title="Class Averages"
                      series={radialData}
                    />
                  </Card>
                  <Card className="after:block m-4">
                    <GraphChoice
                      form="Radial"
                      title="Class Averages"
                      series={radialData}
                    />
                  </Card>
                  <Card className="after:block m-4">
                    <GraphChoice
                      form="Radial"
                      title="Class Averages"
                      series={radialData}
                    />
                  </Card>
                </div>
                <Card className="h-96 p-4 m-4">
                  <GraphChoice
                    form="BoxWhisker"
                    title="Class Averages"
                    xaxisLabels={["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "W"]}
                    series={Boxdat}
                  />
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

export async function getServerSideProps(context) { //read url props, ex: ?sections=624026d53b93c05ddb026bcc,62410a2ce27d0c74c4093d8d,62410a2de27d0c74c4093d8f
  if (!context.query.hasOwnProperty('sections')) {
	return {
      props: {
        sections: []
      }
	}
  }

  return {
    props: {
      sections: await Promise.all(
        context.query.sections.split(',').map(section => fetch(
            'https://api.utdnebula.com/section/' + section,
            {
              method: 'GET',
              headers: {
                'x-api-key': process.env.REACT_APP_NEBULA_API_KEY,
                Accept: 'application/json',
              },
            }
          )
          .then(response => response.json())
          .then(data => {
            if (data.message !== 'success') {
              throw new Error('Nebula API Error', data.data);
            }
            return data.data;
          })
        )
      )
	  .then(responses => responses)
	  .catch(error => [])
    }
  }
}

export default Dashboard;
