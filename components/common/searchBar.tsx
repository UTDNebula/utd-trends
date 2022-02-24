import {SearchIcon} from './searchIcon'
import * as React from 'react';
import { withStyles } from '@mui/material';
import { SvgIcon } from '@mui/material';

type SearchProps={
    setSearch:Function
}



export const SearchBar = (props:SearchProps)=>{
    const [count,setCount] = React.useState(0);
    return <>
    <div className=' text-primary m-auto w-11/12 -translate-y-1/2'>
        <div className='translate-y-10 translate-x-4 w-8 h-8'>
            <SearchIcon />
        </div>
        <input type='search' 
        id='mainSearch'
        className='rounded-sm border-primary-dark border-2 w-full h-12 pl-12 bg-white text-primary-dark placeholder-primary-dark font-semibold' 
        placeholder='Search section number, professor name, course number....' 
        onKeyPress={e=> e.key==='Enter' && props.setSearch(e.currentTarget.value)}/>
    </div>
    </>
}