import type { NextPage } from 'next';
import Card from '@mui/material/Card';
import styles from '../styles/Home.module.css';
import VisualBubble from '../components/graph/visual-bubble';
import { SearchBar } from '../components/common/searchBar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FlatLogoIcon } from '../components/common/flatLogoIcon';
import { useState } from 'react';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const Home: NextPage = () => {
  const [searchVal, setSearchVal] = useState('')
  return (
    <>
      <div className="w-full justify-center items-center bg-gradient-to-b from-primary to-primary-light text-primary-darker ">
        <div className='w-full h-2/3 absolute translate-y-1/4 overflow-x-hidden overflow-hidden'>
        <svg width="2100" height="500" viewBox="0 0 1920 469" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_f_121_1243)">
          <path d="M2013.5 332C2111.46 270.26 2016.01 190.29 1995.67 132.889C1820.67 236.889 1325.67 357.997 1190.67 195.388C1099.08 84.8018 1019.56 1.80374 795.823 2.00035C613.087 6.73091 468.168 24.3884 235.168 134.388C235.168 134.388 46.0801 221.279 -17.3313 248.499C-28.4192 255.491 -91.0588 343.5 -54.8574 343.5C-28.8574 343.5 -84.5282 360.043 -17.3313 326.388C115.669 259.778 838.646 178.5 925.5 344.5C1010 506 1999.5 512.5 2013.5 332Z" fill="url(#paint0_linear_121_1243)" fill-opacity="0.9"/>
          <path d="M2013.5 332C2111.46 270.26 2016.01 190.29 1995.67 132.889C1820.67 236.889 1325.67 357.997 1190.67 195.388C1099.08 84.8018 1019.56 1.80374 795.823 2.00035C613.087 6.73091 468.168 24.3884 235.168 134.388C235.168 134.388 46.0801 221.279 -17.3313 248.499C-28.4192 255.491 -91.0588 343.5 -54.8574 343.5C-28.8574 343.5 -84.5282 360.043 -17.3313 326.388C115.669 259.778 838.646 178.5 925.5 344.5C1010 506 1999.5 512.5 2013.5 332Z" fill="#BEBCBC" fill-opacity="0.25"/>
          </g>
          <defs>
          <filter id="filter0_f_121_1243" x="-68" y="0" width="2126.94" height="468.51" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="1" result="effect1_foregroundBlur_121_1243"/>
          </filter>
          <linearGradient id="paint0_linear_121_1243" x1="1015.12" y1="2" x2="1015.12" y2="472.746" gradientUnits="userSpaceOnUse">
          <stop offset="0.119792" stop-color="#BB6BD9"/>
          <stop offset="1" stop-color="#4659A7"/>
          </linearGradient>
          </defs>
        </svg>
   
        </div>
        <div className='w-full h-2/3 absolute translate-y-1/3 overflow-x-hidden overflow-hidden'>
          <svg width="2100" height="500" viewBox="0 0 1920 471" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g filter="url(#filter0_f_106_1261)">
              <path d="M1954.53 326.388C2052.48 264.648 1960.86 190.29 1940.53 132.889C1765.53 236.889 1270.53 357.997 1135.53 195.388C1043.93 84.8018 964.413 1.80374 740.681 2.00035C557.944 6.73091 413.026 24.3884 180.026 134.388C180.026 134.388 -9.06244 221.279 -72.4738 248.499C-83.5617 255.491 -83.6753 311.388 -47.4739 311.388C-21.4739 311.388 -34.171 319.854 33.026 286.2C166.026 219.589 763.578 133.306 866 326.388C970.5 523.388 1940.53 506.888 1954.53 326.388Z" fill="url(#paint0_linear_106_1261)"/>
              <path d="M1954.53 326.388C2052.48 264.648 1960.86 190.29 1940.53 132.889C1765.53 236.889 1270.53 357.997 1135.53 195.388C1043.93 84.8018 964.413 1.80374 740.681 2.00035C557.944 6.73091 413.026 24.3884 180.026 134.388C180.026 134.388 -9.06244 221.279 -72.4738 248.499C-83.5617 255.491 -83.6753 311.388 -47.4739 311.388C-21.4739 311.388 -34.171 319.854 33.026 286.2C166.026 219.589 763.578 133.306 866 326.388C970.5 523.388 1940.53 506.888 1954.53 326.388Z" fill="#E0E0E0" fill-opacity="0.25"/>
              </g>
              <defs>
              <filter id="filter0_f_106_1261" x="-81" y="0" width="2081.95" height="470.018" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feGaussianBlur stdDeviation="1" result="effect1_foregroundBlur_106_1261"/>
              </filter>
              <linearGradient id="paint0_linear_106_1261" x1="959.977" y1="2" x2="959.977" y2="472.746" gradientUnits="userSpaceOnUse">
              <stop offset="0.119792" stop-color="#8E6BD9"/>
              <stop offset="1" stop-color="#3673C6"/>
              </linearGradient>
              </defs>
            </svg>    
        </div>
        <div className='flex justify-center content-center h-screen '>
          <div className='h-1/4 w-full relative m-auto'>
            <Card className='bg-light relative sm:w-5/12 overflow-visible drop-shadow-lg rounded-xl bg-opacity-50 m-auto xs:w-11/12'>
              <div className='bottom-0 absolute text-dark w-full h-1/4 m-auto pb-12 mt-4 mb-4'>
                <SearchBar setSearch={setSearchVal}/>
              </div>
              <div className='w-11/12 h-3/4 m-auto -translate-y-1/2 relative'>
                  <Card className='bg-primary-dark rounded-xl drop-shadow-lg text-light p-8 relative h-full'>
                  <div className="m-auto  w-1/5">
                    <FlatLogoIcon></FlatLogoIcon>
                  </div>
                  <div className="text-center pb-2">
                      <h2 className='text-headline4'>Welcome to Athena!</h2>
                    </div>
                  </Card>
              </div>
              
            </Card>
          </div>
        </div>          
      </div>
      <VisualBubble title="Test" form ="Bar" dataset1data={[1,4,6,3]} labels={['Dog','Cat','Lizard','Rodent']} dataset1label='Awesome'></VisualBubble>

      
    </>
  );
};

export default Home;
