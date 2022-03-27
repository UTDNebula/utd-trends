import { useEffect, useState } from 'react';
import { SearchTermCard } from './searchTermCard';
import Card from '@mui/material/Card';
import { CardContent } from '@mui/material';
import { SearchBar } from './searchBar';

/**
 * Data types used by the options
 */
interface Components {
  subject:string;
  course:string;
  professor:string;
}
interface Suggestion {
  suggestion:string;
  components: Components;
}

/**
 * This component returns a bar that will allow users to add and remove search terms (up to 3 max)
 * using the SearchBar component. The currently selected search terms are represented by
 * SearchTermCard components, and are displayed from left to right in this grid.
 */
export const ExpandableSearchGrid = () => {
  const [value, setValue] = useState<Suggestion[] | undefined>([]);
  const [searchTerms, setSearchTerms] = useState<Suggestion[]>([]);
  const [searchDisabled, setSearchDisable] = useState<boolean>(false);

  /**
   * Add a search term to the search grid (max 3).
   * @param newSearchTerm The Suggestion to add and display with a card
   */
  function addSearchTerm(newSearchTerm: Suggestion) {
    if (newSearchTerm != null) {
      console.log('adding ' + newSearchTerm + ' to the search terms.');
      setSearchTerms([...searchTerms, newSearchTerm]);
    }
  }

  /**
   * Remove a search term from the grid.
   * @param searchTerm The suggestion string (unique to each search term) used to filter out the corresponding
   *                   Suggestion from the values and stored terms
   */
  function deleteSearchTerm(searchTerm: string) {
    console.log('deleteSearchTerm called on ' + searchTerm);
    setSearchTerms(searchTerms.filter((item) => item.suggestion !== searchTerm));
    setValue(value?.filter((item) => item.suggestion !== searchTerm));
  }

  useEffect(() => {
    if (searchTerms.length >= 3) {
      setSearchDisable(true);
    } else {
      setSearchDisable(false);
    }
  }, [searchTerms]);

  return (
    <div className="w-full min-h-[72px] grid grid-flow-row auto-cols-fr md:grid-flow-col justify-center">
      {searchTerms.map((option: Suggestion, index: number) => (
        <SearchTermCard
          primaryText={option.components.subject + " " + option.components.course}
          secondaryText={option.components.professor}
          key={option.components.subject + option.components.course + option.components.professor}
          index={index}
          legendColor={colors[index]}
          onCloseButtonClicked={deleteSearchTerm}
          suggestion={option.suggestion}
        />
      ))}
      {searchTerms.length < 3 ? (
        <Card className="bg-primary-light" sx={{ borderRadius: 0 }}>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 1.5,
              '&:last-child': {
                paddingBottom: 1.5,
              },
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

const colors = ['#ffadad', '#9bf6ff', '#caffbf'];
