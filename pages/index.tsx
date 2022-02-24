import type { NextPage } from 'next';
import Card from '@mui/material/Card';
import styles from '../styles/Home.module.css';
import VisualBubble from '../components/graph/visual-bubble';
import { SearchBar } from '../components/common/searchBar';
import { WaveSVG } from '../components/common/waveSVG';
import { Wave2SVG } from '../components/common/wave2SVG';
import router from 'next';
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
import Head from 'next/head';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

/*
Title: Home
Last Updated: 2/24/2022
LastUpdated By: Eric Boysen - Project Nebula Team Athena

Returns the home page with Nebula Branding, waved background, and SearchBar Components
*/
const Home: NextPage = () => {
  const [searchVal, setSearchVal] = useState('');
  return (
    <>
      <div className="w-full justify-center items-center bg-gradient-to-b from-primary to-light text-primary-darker ">
        <div className="w-full h-2/3 absolute translate-y-1/4 overflow-x-hidden overflow-hidden">
          <WaveSVG />
        </div>
        <div className="w-full h-2/3 absolute translate-y-1/3 overflow-x-hidden overflow-hidden">
          <Wave2SVG />
        </div>
        <div className="flex justify-center content-center h-screen translate-y-">
          <div className="h-1/4 w-full relative m-auto">
            <Card className="bg-light relative sm:w-5/12 overflow-visible drop-shadow-lg rounded-xl bg-opacity-50 m-auto xs:w-11/12">
              <div className="bottom-0 absolute text-dark w-full h-1/4 m-auto pb-12 mt-4 mb-4">
                <SearchBar setSearch={setSearchVal} />
              </div>
              <div className="w-11/12 h-3/4 m-auto -translate-y-1/2 relative">
                <Card className="bg-primary-dark rounded-xl drop-shadow-lg text-light p-8 relative h-full">
                  <div className="m-auto  w-1/5">
                    <FlatLogoIcon></FlatLogoIcon>
                  </div>
                  <div className="text-center pb-2">
                    <h2 className="text-headline4">Welcome to Athena!</h2>
                  </div>
                </Card>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
