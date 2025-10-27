import type { GradesData } from '@/modules/fetchGrades';
import type { RMP } from '@/modules/fetchRmp';
import type { SectionsData } from '@/modules/fetchSections';

export type SearchQuery = {
  prefix?: string;
  number?: string;
  profFirst?: string;
  profLast?: string;
  sectionNumber?: string;
};

export type Professor = {
  profFirst: string;
  profLast: string;
};

export type Course = {
  prefix: string;
  number: string;
};

export type SearchQueryMultiSection = {
  prefix?: string;
  number?: string;
  profFirst?: string;
  profLast?: string;
  sectionNumbers?: string[];
};

export type SearchResult =
  | {
      type: 'course';
      grades: GradesData;
      searchQuery: {
        prefix: string;
        number: string;
        profFirst?: string;
        profLast?: string;
        sectionNumber?: string;
      };
      sections: SectionsData;
      courseName: string;
    }
  | {
      type: 'professor';
      grades: GradesData;
      RMP?: RMP;
      searchQuery: {
        prefix?: string;
        number?: string;
        profFirst: string;
        profLast: string;
        sectionNumber?: string;
      };
      sections: SectionsData;
    }
  | {
      type: 'combo';
      grades: GradesData;
      RMP?: RMP;
      searchQuery: {
        prefix: string;
        number: string;
        profFirst: string;
        profLast: string;
        sectionNumber?: string;
      };
      sections: SectionsData;
      courseName: string;
    };

export function convertToProfOnly(
  searchQuery: SearchQuery,
): Professor | Record<string, never> {
  if (!('profFirst' in searchQuery && 'profLast' in searchQuery)) {
    return {};
  }
  return {
    profFirst: searchQuery.profFirst as string,
    profLast: searchQuery.profLast as string,
  };
}

export function convertToCourseOnly(
  searchQuery: SearchQuery,
): Course | Record<string, never> {
  if (!('prefix' in searchQuery && 'number' in searchQuery)) {
    return {};
  }
  return {
    prefix: searchQuery.prefix as string,
    number: searchQuery.number as string,
  };
}

export function isProfessorQuery(
  searchQuery: SearchQuery,
): searchQuery is SearchQuery & { profFirst: string; profLast: string } {
  return (
    searchQuery.profFirst !== undefined && searchQuery.profLast !== undefined
  );
}

export function isCourseQuery(
  searchQuery: SearchQuery,
): searchQuery is SearchQuery & { prefix: string; number: string } {
  return searchQuery.prefix !== undefined && searchQuery.number !== undefined;
}

export function removeSection(
  searchQuery: SearchQuery | SearchQueryMultiSection,
): SearchQuery {
  const result = { ...searchQuery };
  if ('sectionNumber' in result) {
    delete result.sectionNumber;
  }
  if ('sectionNumbers' in result) {
    delete result.sectionNumbers;
  }
  return result;
}

export function searchQueryMultiSectionSplit(
  searchQuery: SearchQueryMultiSection,
): SearchQuery[] {
  if (typeof searchQuery.sectionNumbers === 'undefined') {
    return [];
  }
  return searchQuery.sectionNumbers.map((section) => {
    const result = { ...searchQuery, sectionNumber: section };
    delete result.sectionNumbers;
    return result;
  });
}

export function sectionCanOverlap(section: string, type?: string): boolean {
  if (type == "exam")
    return /^[7]/.test(section);
  else if (type == "extra")
      return /^[1236]/.test(section);
  return /^[12367]/.test(section);
}

export function searchQueryLabel(query: SearchQuery): string {
  let result = '';
  if (typeof query.prefix !== 'undefined') {
    result += query.prefix;
  }
  if (typeof query.number !== 'undefined') {
    result += ' ' + query.number;
  }
  if (typeof query.sectionNumber !== 'undefined') {
    result += '.' + query.sectionNumber;
  }
  if (
    typeof query.profFirst !== 'undefined' &&
    typeof query.profLast !== 'undefined'
  ) {
    result += ' ' + query.profFirst + ' ' + query.profLast;
  }
  return result.trim();
}

export function searchQueryEqual(
  query1: SearchQuery,
  query2: SearchQuery,
): boolean {
  if (query1.prefix !== query2.prefix) {
    return false;
  }
  if (
    query1.profFirst !== query2.profFirst ||
    query1.profLast !== query2.profLast
  ) {
    return false;
  }
  if (query1.number !== query2.number) {
    return false;
  }
  if (query1.sectionNumber !== query2.sectionNumber) {
    return false;
  }
  return true;
}

export function decodeSearchQueryLabel(encodedSearchTerm: string): SearchQuery {
  const encodedSearchTermParts = decodeURIComponent(encodedSearchTerm)
    .replaceAll('+', ' ')
    .split(' ');
  // Does it start with prefix
  if (
    /^([A-Z]{2,4})$/.test(encodedSearchTermParts[0]) &&
    // If it has only 2 parts, make sure the second is a course number
    // Otherwise the name SV Randall will decode as { prefix: 'SV', profFirst: '', profLast: 'Randall' }
    (encodedSearchTermParts.length != 2 ||
      /^([0-9A-Z]{4})$/.test(encodedSearchTermParts[1]))
  ) {
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

export function removeDuplicates(array: SearchQuery[]) {
  return array.filter(
    (obj1, index, self) =>
      index === self.findIndex((obj2) => searchQueryEqual(obj1, obj2)),
  );
}

export function searchQuerySort(a: SearchQuery, b: SearchQuery) {
  if ('profLast' in a && 'profLast' in b) {
    //handle undefined variables based on searchQueryLabel
    const aFirstName = a.profFirst ?? '';
    const bFirstName = b.profFirst ?? '';
    const aLastName = a.profLast ?? '';
    const bLastName = b.profLast ?? '';

    return (
      aLastName.localeCompare(bLastName) || aFirstName.localeCompare(bFirstName) //sort by last name then first name
    );
  }
  if ('prefix' in a && 'prefix' in b) {
    const aPrefix = a.prefix ?? ''; //make sure the is no empty input for prefix and number
    const bPrefix = b.prefix ?? '';
    const aNumber = a.number ?? '';
    const bNumber = b.number ?? '';

    return aPrefix.localeCompare(bPrefix) || aNumber.localeCompare(bNumber); //sort by prefix then number
  }
  if ('prefix' in a) {
    // Courses first
    return -1;
  }
  return 1;
}
