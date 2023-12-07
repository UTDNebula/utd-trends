import SearchQuery from '../SearchQuery/SearchQuery';

function searchQueryLabel(query: SearchQuery): string {
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

export default searchQueryLabel;
