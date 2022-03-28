import {useContext, useEffect, useState} from 'react';
import { SearchTermCard } from './searchTermCard';
import Card from '@mui/material/Card';
import { CardContent } from '@mui/material';
import { SearchBar } from './searchBar';
import {SearchTermsContext} from "../../context/dashboardState";
import {useRouter} from "next/router";

interface Film {
  title: string;
  year: number;
}

/**
 * This component returns a bar that will allow users to add and remove search terms (up to 3 max)
 * using the SearchBar component. The currently selected search terms are represented by
 * SearchTermCard components, and are displayed from left to right in this grid.
 */
export const ExpandableSearchGrid = () => {

  const router = useRouter();

  const { state: searchTerms, update: setSearchTerms } = useContext(SearchTermsContext);

  const [value, setValue] = useState<Film[] | undefined>([]);
  const [searchDisabled, setSearchDisable] = useState<boolean>(false);

  function addSearchTerm(newSearchTerm: Film) {
    if (newSearchTerm != null) {
      console.log('adding ' + newSearchTerm + ' to the search terms.');
      setSearchTerms([...searchTerms, newSearchTerm]);
    }
  }

  function deleteSearchTerm(searchTerm: string) {
    console.log('deleteSearchTerm called on ' + searchTerm);
    setSearchTerms(searchTerms.filter((item) => item.title !== searchTerm));
    setValue(value?.filter((item) => item.title !== searchTerm));
  }

  useEffect(() => {
    switch (searchTerms.length) {
      case 0:
        router.push("/dashboard");
        break;
      case 1:
        router.push("/dashboard?first_term=" + encodeURIComponent(searchTerms[0].title));
        break;
      case 2:
        router.push("/dashboard?first_term=" + encodeURIComponent(searchTerms[0].title) +
                                  "&second_term=" + encodeURIComponent(searchTerms[1].title));
        break;
      case 3:
        router.push("/dashboard?first_term=" + encodeURIComponent(searchTerms[0].title) +
                                  "&second_term=" + encodeURIComponent(searchTerms[1].title) +
                                  "&third_term=" + encodeURIComponent(searchTerms[2].title));
        break;
    }
    if (searchTerms.length >= 3) {
      setSearchDisable(true);
    } else {
      setSearchDisable(false);
    }
  },[searchTerms]);

  return (
    <div className="w-full min-h-[72px] grid grid-flow-row auto-cols-fr md:grid-flow-col justify-center">
      {searchTerms.map((option: Film, index: number) => (
        <SearchTermCard
          primaryText={option.title}
          secondaryText={'' + option.year}
          key={option.title}
          index={index}
          legendColor={colors[index]}
          onCloseButtonClicked={deleteSearchTerm}
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
