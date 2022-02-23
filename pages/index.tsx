import type { NextPage } from 'next';
import TextField from '@mui/material/TextField';
import { Autocomplete } from '@mui/material';
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
  return (
    <>
      <div className="flex h-screen w-screen justify-center items-center bg-gradient-to-b from-primary-light to-primary-dark">
        <div>
          <div className="m-auto ">
            <img
              src="./Project_Nebula_Logo.svg"
              className="m-auto w-1/3 shadow-black"
            ></img>
          </div>
          <div className="text-center">
            <h1 className={styles.title}>Welcome to Athena!</h1>
          </div>
          <p className="text-center pb-8">
            Your new dashboard for UTD Grades and course information
          </p>
          <SearchBar/>
        </div>
        
        
        
      </div>

      
    </>
  );
};

export default Home;
