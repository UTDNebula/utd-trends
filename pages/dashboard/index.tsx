import { Card } from '@mui/material';
import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
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
  
  let dat = [
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },
  ];
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
  if (props.promise) {
    console.log(props.promise);
    dat = [];
    for (const section of props.promise) {
      dat.push({name: section.data.section_number + ' ' + section.data.academic_session.name, data: section.data.grade_distribution});
    }
  }

  /*const [dat, setDat] = useState([
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },
  ]);
  const [Boxdat, setBoxdat] = useState([
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },
  ]);
  const [radialData, setRadialData] = useState([
    { name: 'Jason', data: [(3.1/4)*100]}, 
    { name: 'Kelly', data: [(2.6/4)*100]}, 
    { name: 'Smith', data: [(3.9/4)*100]}
  ]);*/
  // radialData was previously: 
  // var radialData = [(3.1 / 4) * 100, (2.6 / 4) * 100, (3.9 / 4) * 100];
  // but RadialBarChart has been refactored to now take series props in the same format as other graph components. 

  //const [state, setState] = useState('');
  /*useEffect(() => {
    setState('loading');
    getProfessorGradeList(subjectPrefix, courseNumber, professors).then((resolve) => {
      console.log(resolve);
      let newDat = [];
      for (let i = 0; i < resolve.length; i++) {
        for (let j = 0; j < resolve[i].grades.length; j++) {
         newDat.push({name: resolve[i].professor + ' ' + resolve[i].grades[j].section + ' ' + resolve[i].grades[j].academicSession, data: resolve[i].grades[j].distribution});
        }
      }
      setDat(newDat);
      setBoxdat(newDat);
      setState('success');
    }).catch((reject) => {
      console.error('Error:', reject);
      setState('error');
    });
  }, []);*/
  /*if (state === 'error' || state === 'loading') {
    return (
      <>
      <div className=" w-full bg-light h-full">
        <TopMenu />
        <ExpandableSearchGrid/>
        <div className="w-full h-5/6 justify-center">
          <div className="w-full h-5/6 relative min-h-full">
            <Carousel>
              <div className="h-full m-4 ">
                <Card className="h-96 p-4 m-4"></Card>
                <Card className="h-96 p-4 m-4"></Card>
              </div>
              <div className="p-4 h-full">
                <div className='grid grid-cols-1 md:grid-cols-3'>
                  <Card className='after:block m-4'></Card>
                  <Card className='after:block m-4'></Card>
                  <Card className='after:block m-4'></Card>
                </div>
                <Card className="h-96 p-4 m-4"></Card>
              </div>
              <div className=" ">Hi</div>
            </Carousel>
          </div>
        </div>
      </div>
    </>
    );
  }*/
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
                    title="Grades Distribution"
                    xaxisLabels={['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W']}//{['A', 'B', 'C', 'D', 'F', 'CR', 'NC']}
                    series={dat}
                  />
                </Card>
                <Card className="h-96 p-4 m-4">
                  <GraphChoice
                    form="Line"
                    title="Class Averages"
                    xaxisLabels={['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W']}
                    series={dat}
                  />
                </Card>
              </div>
              <div className="p-4 h-full">
                <div className='grid grid-cols-1 md:grid-cols-3'>
                  <Card className='after:block m-4'>
                  <GraphChoice
                      form="Radial"
                      title="Class Averages"
                      series={radialData}
                    />
                  </Card>
                  <Card className='after:block m-4'>
                    <GraphChoice
                      form="Radial"
                      title="Class Averages"
                      series={radialData}
                    />
                  </Card>
                  <Card className='after:block m-4'>
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
                    xaxisLabels={['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W']}
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

export async function getServerSideProps(context) {
  console.log('hiiiiiiiii!!!', context.query, process.env.REACT_APP_NEBULA_API_KEY);
  const searchOptions = ["course_number", "subject_prefix", "title", "description", "school", "credit_hours", "class_level", "activity_type", "grading", "internal_course_number", "lecture_contact_hours", "laboratory_contact_hours", "offering_frequency"];
  let params = "";
  for (const searchOption of searchOptions) {
    if (context.query.hasOwnProperty(searchOption)) {
      params += "&" + searchOption + "=" + context.query[searchOption];
    }
  }
  console.log(params);
  const headers = {
    "x-api-key": process.env.REACT_APP_NEBULA_API_KEY,
    Accept: "application/json",
  };
  
  let sectionPromises = [];
  
  await new Promise((resolve, reject) => {
    try {
      fetch(
        `https://api.utdnebula.com/course?` + params,
        {
          method: "GET",
          headers: headers,
        }
      )
        .then(function (res) {
          resolve(res.json());
        })
        .catch(function (err) {
          console.log("Nebula error is: ",err);
          reject(err);
        });
    } catch (err) {
      console.log("Error getting data: " + err);
      reject(err);
    }
  }).then(function(result) {
    console.log(result);
    for (const uniqueClass of result.data) {
      for (const section of uniqueClass.sections) {
		sectionPromises.push(new Promise((resolve, reject) => {
          try {
            fetch(
              `https://api.utdnebula.com/section/` + section,
              {
                method: "GET",
                headers: headers,
              }
            )
              .then(function (res) {
                resolve(res.json());
              })
              .catch(function (err) {
                console.log("Nebula error is: ",err);
                reject(err);
              });
          } catch (err) {
            console.log("Error getting data: " + err);
            reject(err);
          }
        }));
      }
    }
  });
  
  //return getClassesPromise;
  return {
    props: {
      promise: await Promise.all(sectionPromises).then((values) => {
        console.log(values);
		return values;
      })
    },
  }
}

export default Dashboard;
