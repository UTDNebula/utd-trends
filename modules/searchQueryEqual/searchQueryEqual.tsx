import SearchQuery from '../SearchQuery/SearchQuery';

function searchQueryEqual(query1: SearchQuery, query2: SearchQuery): boolean {
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

export default searchQueryEqual;
