import type { NextPage } from 'next';
import TextField from '@mui/material/TextField';
import { Autocomplete } from '@mui/material';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <>
      <div className="flex h-screen w-screen justify-center items-center">
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
          <p className="text-center">
            Your new dashboard for UTD Grades and course information
          </p>
          <Autocomplete
            className="m-auto w-11/12"
            id="combo-box-demo"
            options={[]}
            sx={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Serach by professor name, section id, course id, or course name..."
              />
            )}
            freeSolo
            fullWidth
          />
        </div>
      </div>
    </>
  );
};

export default Home;
