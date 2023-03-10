import { Card } from '@mui/material';
import type { NextPage } from 'next';
import { useState } from 'react';
import Carousel from '../../components/common/Carousel/carousel';
import { GraphChoice } from '../../components/graph/GraphChoice/GraphChoice';
import TopMenu from '../../components/navigation/topMenu/topMenu';
import { ExpandableSearchGrid } from '../../components/common/ExpandableSearchGrid/expandableSearchGrid';
import Box from '@mui/material/Box';
import { ProfessorCard } from "../../components/common/ProfessorCard/ProfessorCard"

import { useMediaQuery } from '@mui/material';

//import useWindowSize from './windowHook'

var i = 1;



 
 
 
 


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

  const ratings = [];

  let profDifficulty = 5;
  let avgRating = 2;
  let profRetake = 10;

  //const size = useWindowSize();

  console.log("yes, this function calls again"+i);
  





  


  ratings.push(5 - profDifficulty, avgRating, profRetake/20);
  const colorCodes = [];

  for (let i=0; i < ratings.length; i++){
    console.log(ratings[i]);
    if (ratings[i] >= 0 && ratings[i] <  1.7){
      var colorCode =  "#ec5353";
      console.log("Red");
      colorCodes.push(colorCode);
    }else if(ratings[i] > 1.6 && ratings[i] <  2.7){
      var colorCode =  "#ecb653";
      colorCodes.push(colorCode);
      console.log("Orange");
   }else if(ratings[i] > 2.6 && ratings[i] < 4){

      var colorCode = "#f4ee5a"
      colorCodes.push(colorCode);
      console.log("Yellow");
  }else if(ratings[i] > 3.9 && ratings[i] <= 5){

    var colorCode = "#75f340"
    colorCodes.push(colorCode);
    console.log("Green");
}

  }

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
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },
  ];
  var Boxdat = [
    { name: 'Smith', data: [1, 2, 3, 4, 1] },
    { name: 'Jason', data: [2, 5, 1, 6, 9] },
    { name: 'Suzy', data: [2, 5, 2, 1, 1] },
  ];
  var radialData = [
    { name: "Jason", data: [(3.1/4)*100]}, 
    { name: "Kelly", data: [(2.6/4)*100]}, 
    { name: "Smith", data: [(3.9/4)*100]}
  ];
  // radialData was previously: 
  // var radialData = [(3.1 / 4) * 100, (2.6 / 4) * 100, (3.9 / 4) * 100];
  // but RadialBarChart has been refactored to now take series props in the same format as other graph components. 

  



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
                    xaxisLabels={['A', 'B', 'C', 'D', 'F', 'CR', 'NC']}
                    series={dat}
                  />
                </Card>
                <Card className="h-96 p-4 m-4">
                  <GraphChoice
                    form="Line"
                    title="Class Averages"
                    xaxisLabels={['A', 'B', 'C', 'D', 'F', 'CR', 'NC']}
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
                    title="Class Average"
                    xaxisLabels={['A', 'B', 'C', 'D', 'F', 'CR', 'NC']}
                    series={Boxdat}
                  />
                </Card>
              </div>

            <div className="grid grid-cols-2 md:grid-cols-6 grid-container-2"  >
             
                 


            
          <div classname = ".TabDivider">           
          </div>

          
        <div className="w-full md:w-1/2 p-4" style={{ paddingBottom: "100%"}}>      
          <div className=".profcard-container" style = {{position: "relative", top: "-19%", left: "-90", paddingBottom: "10%", padding: "9rem"}}> 
            
               
                 <Card className="h-100 p-4 m-4 md:h-full md:w-1700" style = {{ width: "1200px", height: "600%"}}>  
                   <ProfessorCard
                        position = "relative"
                        Element = "Card"
                        top = "100%"
                        left = "0%"
                        height = "320%"
                        ProfessorRating = {avgRating}
                        avgDifficulty = {profDifficulty}
                        takingAgain = {profRetake}
                        colorCode = {colorCodes}
                        name = "Timothy Farage"
                        department = "Computer Science"
  
                       />
  
  
                     </Card>


         
                </div>
              </div>
             </div>
                 
           
            </Carousel>

          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;
