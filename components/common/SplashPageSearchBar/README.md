### Splash Page Search Example
```ts
import {useState} from 'react';

const [value, setValue] = useState([]);

const onSelectOption = () => {}

<SplashPageSearchBar
    selectSearchValue={onSelectOption}
    value={value}
    setValue={setValue}
    disabled={false}
    />
```