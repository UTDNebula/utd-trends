import { Input } from '@mui/material';

export const SearchGrid = () => {
  return (
    <div className="grid grid-flow-row grid-rows-1 grid-cols-3  bg-primary text-light">
      <div className="w-full p-4">
        <Input
          placeholder="+ Add Courses"
          className="w-full text-light"
        ></Input>
      </div>
      <div className="w-full p-4">
        <Input
          placeholder="+ Add Courses"
          className="w-full text-light"
        ></Input>
      </div>
      <div className="w-full p-4">
        <Input
          placeholder="+ Add Courses"
          className="w-full text-light"
        ></Input>
      </div>
    </div>
  );
};

export default SearchGrid;
