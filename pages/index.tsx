import type { NextPage } from 'next';
import Card from '@mui/material/Card';
import { SplashPageSearchBar } from '../components/common/splashPageSearchBar';
import { WaveSVG } from '../components/common/waveSVG';
import { Wave2SVG } from '../components/common/wave2SVG';
import { FlatLogoIcon } from '../components/common/flatLogoIcon';
import { useState } from 'react';
import styles from '../styles/Home.module.css';

interface Film {
  title: string;
  year: number;
}
/**
 * Returns the home page with Nebula Branding, waved background, and SearchBar Components
 */
const Home: NextPage = () => {
  const [value, setValue] = useState<Film[] | undefined>([]);

  function searchOptionChosen(chosenOption: any) {
    console.log('The option chosen was: ', chosenOption);
  }

  return (
    <>
      <div className="w-full justify-center items-center bg-gradient-to-b from-primary to-primary-light text-primary-darker overflow-hidden">
        <div className="w-full h-2/3 absolute translate-y-1/4 overflow-x-hidden overflow-hidden"> 
          <WaveSVG />
        </div>
        <div className="w-full h-2/3 absolute translate-y-1/3 overflow-x-hidden overflow-hidden">
          <Wave2SVG />
        </div>
        <div className="flex justify-center content-center h-screen" style={{marginLeft: "10vw", marginRight: "10vw"}}>
          <div className="w-full relative m-auto">
            <Card className="bg-light relative overflow-visible drop-shadow-lg rounded-xl bg-opacity-75 sm:w-3/4 xs:w-11/12 md:w-3/4 mx-auto my-4">
              <div className="m-auto md:w-32 sm:w-3/12 xs:w-3/12 xxs:w-4/12 translate-y-1/4 lg:translate-y-5" style={{color: "black"}}>
                <FlatLogoIcon />
              </div>
              <div className="text-center pb-4 m-5 mt-8 text-3xl lg:text-5xl 2xl:text-6xl font-light" style={{color: "#4F4F4F"}}>
                <h1>Welcome to Athena</h1>
              </div>
              <SplashPageSearchBar
                    selectSearchValue={searchOptionChosen}
                    value={value}
                    setValue={setValue}
                    disabled={false}
                  />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
