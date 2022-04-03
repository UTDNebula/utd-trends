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
      <div className="w-full justify-center items-center bg-gradient-to-b from-primary to-light text-primary-darker ">
        <div className="w-full h-2/3 absolute translate-y-1/4 overflow-x-hidden overflow-hidden">
          <WaveSVG />
        </div>
        <div className="w-full h-2/3 absolute translate-y-1/3 overflow-x-hidden overflow-hidden">
          <Wave2SVG />
        </div>
        <div className="flex justify-center content-center h-screen" style={{marginLeft: "10vw", marginRight: "10vw"}}>
          <div className="w-full relative m-auto">
            <Card className="bg-light relative overflow-visible drop-shadow-lg rounded-xl bg-opacity-75 m-auto sm:w-5/12 xs:w-11/12 md:w-3/5 ">
              <div className='' style={{margin: "1rem"}}>
                <div className="m-auto" style={{margin: "1rem", width: "145px", color: "black"}}>
                  <br />
                  <FlatLogoIcon />
                </div>
              </div>
              <div className="text-center pb-2" style={{fontWeight: "300", fontSize: "5vw", color: "#4F4F4F"}}>
                <h2>Welcome to Athena</h2>
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
