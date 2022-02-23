import SearchIcon from '@material-ui/icons/Search'
import * as React from 'react';
import { withStyles } from '@mui/material';
import { SvgIcon } from '@mui/material';


export const SearchBar = ()=>{
    const [count,setCount] = React.useState(0);
    return <>
        <SearchIcon className='translate-x-8' style={{color:"6d7ec4"}}/>
        <input type='search' className='rounded-xl border-primary-dark border-2 w-11/12 h-12 p-8 bg-white text-primary-dark placeholder-primary-dark font-semibold' placeholder='Search section number, professor name, course number....' />
    </>
}