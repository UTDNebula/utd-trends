import { FilterSearchParams } from './FilterSearchParams';

/**
 * Set search params in the URL without using Next.js's Router
 */
export const navigateWithParams = (
  pathname: string,
  params: URLSearchParams,
) => {
  // Manually replace page URL to avoid triggering re-renders with Next.js's hooks
  window.history.replaceState(
    null,
    '',
    `${pathname}${params.size > 0 ? '?' : ''}${params.toString().replace(/=(?=&|$)/g, '')}`,
  );

  // Manually indicate the page's URL has changed, which will update Next.js's hooks
  window.dispatchEvent(new PopStateEvent('popstate'));
};

/**
 * Modifies the URL search params based off {@linkcode setParamsFn} and navigates to it
 * @param setParamsFn Function to that accepts a mutable params parameter and modifies it
 * @param pathname Optional pathname to override the default, which uses `window.location.pathname`
 */
export const setParams = <
  Schema extends Record<string, unknown> = Record<string, unknown>,
>(
  setParamsFn: (params: FilterSearchParams<Schema>) => void,
  pathname: string = window.location.pathname,
) => {
  const params = new FilterSearchParams<Schema>(window.location.search, {
    onAppend(name, value) {
      console.log(`APPEND ${name} WITH '${value}'`);
    },
    onDelete(name, value) {
      console.log(`DELETE ${name}${value ? ` IF '${value}'` : ''}`);
    },
    onSet(name, value) {
      console.log(`SET ${name} TO '${value}'`);
    },
  });
  setParamsFn(params);
  navigateWithParams(pathname, params);
};
