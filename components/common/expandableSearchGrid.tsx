import { useEffect, useState } from 'react';
import { SearchTermCard } from './searchTermCard';
import Card from '@mui/material/Card';
import { CardContent } from '@mui/material';
import { SearchBar } from './searchBar';

interface Film {
  title: string;
  year: number;
}

export const ExpandableSearchGrid = () => {
  const [value, setValue] = useState<Film[] | undefined>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [searchDisabled, setSearchDisable] = useState<boolean>(false);

  function addSearchTerm(newSearchTerm: string) {
    console.log('adding ' + newSearchTerm + ' to the search terms.');
    setSearchTerms([...searchTerms, newSearchTerm]);
  }

  function deleteSearchTerm(searchTerm: string) {
    console.log('deleteSearchTerm called on ' + searchTerm);
    setSearchTerms(searchTerms.filter((item) => item !== searchTerm));
    setValue(value?.filter((item) => item.title !== searchTerm));
  }

  useEffect(() => {
    // console.log("The searchTerms have updated to ", searchTerms);
    if (searchTerms.length >= 3) {
      setSearchDisable(true);
    } else {
      setSearchDisable(false);
    }
  }, [searchTerms]);

  return (
    <div className="w-full min-h-[75px] grid grid-flow-row auto-cols-fr md:grid-flow-col justify-center">
      {searchTerms.map((option: string, index: number) => (
        <SearchTermCard
          initialValue={option}
          key={option}
          index={index}
          color={colors[index]}
          onCloseButtonClicked={deleteSearchTerm}
        />
      ))}
      {searchTerms.length < 3 ? (
        <Card className="bg-secondary" sx={{ borderRadius: 0 }}>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
            }}
          >
            <SearchBar
              selectSearchValue={addSearchTerm}
              value={value}
              setValue={setValue}
              disabled={searchDisabled}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

const colors = ['#b71c1c', '#0d47a1', '#1b5e20'];
