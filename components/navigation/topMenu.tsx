import { Icon } from '@mui/material';
import { FlatLogoIcon } from '../common/flatLogoIcon';
import HandymanIcon from '@mui/icons-material/Handyman';

export const TopMenu = () => {
  return (
    <div className="bg-primary-dark h-16 text-light relative p-4">
      <div className="h-full float-left flex w-1/4 ">
        <div className="h-full flex align-middle place-items-center justify-center">
          <div className="h-full float-left mr-2">
            <FlatLogoIcon />
          </div>
          <h1 className=" float-right text-xl">Athena</h1>
        </div>
      </div>
      <div className="h-full float-right flex align-middle place-items-center justify-center w-10">
        <HandymanIcon className="w-full " color="inherit" />
      </div>
    </div>
  );
};

export default TopMenu;
