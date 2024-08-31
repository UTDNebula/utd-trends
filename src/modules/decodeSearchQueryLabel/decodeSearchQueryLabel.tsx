import SearchQuery from '../SearchQuery/SearchQuery';

function decodeSearchQueryLabel(encodedSearchTerm: string): SearchQuery {
  const encodedSearchTermParts = encodedSearchTerm.split(' ');
  // Does it start with prefix
  if (/^([A-Z]{2,4})$/.test(encodedSearchTermParts[0])) {
    // If it is just the prefix, return that
    if (encodedSearchTermParts.length == 1) {
      return { prefix: encodedSearchTermParts[0] };
    }
    // Is the second part a course number only
    if (/^([0-9A-Z]{4})$/.test(encodedSearchTermParts[1])) {
      if (encodedSearchTermParts.length == 2) {
        return {
          prefix: encodedSearchTermParts[0],
          number: encodedSearchTermParts[1],
        };
      } else {
        return {
          prefix: encodedSearchTermParts[0],
          number: encodedSearchTermParts[1],
          profFirst: encodedSearchTermParts
            .slice(2, encodedSearchTermParts.length - 1)
            .join(' '),
          profLast: encodedSearchTermParts[encodedSearchTermParts.length - 1],
        };
      }
    }
    // Is the second part a course number and section
    else if (/^([0-9A-Z]{4}\.[0-9A-Z]{3})$/.test(encodedSearchTermParts[1])) {
      const courseNumberAndSection: string[] =
        encodedSearchTermParts[1].split('.');
      if (encodedSearchTermParts.length == 2) {
        return {
          prefix: encodedSearchTermParts[0],
          number: courseNumberAndSection[0],
          sectionNumber: courseNumberAndSection[1],
        };
      } else {
        return {
          prefix: encodedSearchTermParts[0],
          number: courseNumberAndSection[0],
          sectionNumber: courseNumberAndSection[1],
          profFirst: encodedSearchTermParts
            .slice(2, encodedSearchTermParts.length - 1)
            .join(' '),
          profLast: encodedSearchTermParts[encodedSearchTermParts.length - 1],
        };
      }
    }
    // the second part is the start of the name
    else {
      return {
        prefix: encodedSearchTermParts[0],
        profFirst: encodedSearchTermParts
          .slice(1, encodedSearchTermParts.length - 1)
          .join(' '),
        profLast: encodedSearchTermParts[encodedSearchTermParts.length - 1],
      };
    }
  } else {
    return {
      profFirst: encodedSearchTermParts
        .slice(0, encodedSearchTermParts.length - 1)
        .join(' '),
      profLast: encodedSearchTermParts[encodedSearchTermParts.length - 1],
    };
  }
}

export default decodeSearchQueryLabel;
