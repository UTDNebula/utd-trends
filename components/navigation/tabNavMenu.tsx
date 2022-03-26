import {SyntheticEvent} from 'react';
import {Divider, Tab, Tabs} from '@mui/material';

type TabNavMenuProps = {
    value: number;
    setValue: Function;
}

export const TabNavMenu = (props: TabNavMenuProps) => {

    const handleChange = (event: SyntheticEvent, newValue: number) => {
        props.setValue(newValue);
    };

    return (
        <Tabs value={props.value} onChange={handleChange} aria-label="basic tabs example" centered
              className="w-full min-h-[32px] grid grid-flow-row grid-cols-1 md:grid-flow-col justify-center shadow">
            <Tab label="Grades" className="text-lg text-gray-600 normal-case" value={0}/>
            <Tab label="" icon={<Divider orientation="vertical" />} disabled value={-1} className="w-px min-w-[1px]"/>
            <Tab label="Detailed" className="text-lg text-gray-600 normal-case" value={1}/>
        </Tabs>
    );
};
