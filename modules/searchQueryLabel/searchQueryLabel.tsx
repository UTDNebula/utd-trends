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
  if (typeof query.professorName !== 'undefined') {
    result += ' ' + query.professorName;
  }
  return result.trim();
}

export default searchQueryLabel;
