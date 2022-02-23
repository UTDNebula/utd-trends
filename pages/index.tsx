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
import { FlatLogoIcon } from '../components/common/flatLogoIcon';
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
      <div className="flex h-screen w-screen justify-center items-center bg-gradient-to-b from-primary to-primary-light text-primary-darker">
        <div>
          <div className="m-auto text-primary-darker w-1/2 h-56">
            <FlatLogoIcon></FlatLogoIcon>
          </div>
          <div className="text-center pb-2">
            <h1 className={styles.title}>Welcome to Athena!</h1>
          </div>
          <p className="text-center pb-8 text-headline5">
            Your <i>new</i> dashboard for UTD Grades and course information
          </p>
          <SearchBar/>
        </div>
        
        
        
      </div>

      
    </>
  );
};

export default Home;
