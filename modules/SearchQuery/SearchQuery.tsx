type SearchQuery = {
  prefix?: string;
  number?: string;
  profFirst?: string;
  profLast?: string;
  sectionNumber?: string;
};
export default SearchQuery;

export type Professor = {
  profFirst: string;
  profLast: string;
};
