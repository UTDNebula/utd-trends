### Search Bar Example
```ts
import {useState} from 'react';

const [value, setValue] = useState([]);
const [searchTerms, setSearchTerms] = useState([]);
const [searchDisabled, setSearchDisable] = useState(false);

const addSearchTerm = (newSearchTerm) => {
    if (newSearchTerm != null) {
        setSearchTerms([...searchTerms, newSearchTerm]);
    }
}

<SearchBar
    selectSearchValue={addSearchTerm}
    value={value}
    setValue={setValue}
    disabled={searchDisabled}
/>
```