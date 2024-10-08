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
