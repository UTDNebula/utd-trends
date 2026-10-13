import FilterSearchParams, {
  type FilterSearchParamsOptionsWithSchema,
  type FilterSearchParamsSchema,
} from './FilterSearchParams';

/**
 * Set search params in the URL without using Next.js's Router
 */
export function navigateWithParams(pathname: string, params: URLSearchParams) {
  // Manually replace page URL to avoid triggering re-renders with Next.js's hooks
  window.history.replaceState(
    null,
    '',
    `${pathname}${params.size > 0 ? '?' : ''}${params.toString().replace(/=(?=&|$)/g, '')}`,
  );

  // Manually indicate the page's URL has changed, which will update Next.js's hooks
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Modifies the URL search params based off {@linkcode setParamsFn} and navigates to it
 * @param setParamsFn Function to that accepts a mutable params parameter and modifies it
 * @param pathname Optional pathname to override the default. Use `null` for default, which is `window.location.pathname`.
 * @param options Optional options for the {@linkcode FilterSearchParams} object created at runtime
 *
 * @example
 * <caption>Basic usage</caption>
 * setParams((params) => {
 *   params.set("foo", "bar")
 * })
 *
 * @example
 * <caption>With schema</caption>
 * type Schema = { foo: string };
 * setParams<Schema>((params) => {
 *   params.set("foo", "bar");
 * });
 *
 * @example
 * <caption>With options</caption>
 * setParams(
 *   (params) => {
 *     params.set("foo", "bar");
 *   },
 *   null,
 *   {
 *     onSet(name, value) {
 *       console.log(`Set ${name} to ${value}!`);
 *     },
 *   },
 * );
 */
export function setParams<
  Schema extends FilterSearchParamsSchema = FilterSearchParamsSchema,
>(
  setParamsFn: (params: FilterSearchParams<Schema>) => void,
  pathname: string | null = null,
  options: FilterSearchParamsOptionsWithSchema<Schema> = {},
) {
  const params = new FilterSearchParams<Schema>(
    window.location.search,
    options,
  );
  setParamsFn(params);
  if (pathname === null) pathname = window.location.pathname;
  navigateWithParams(pathname, params);
}

/**
 * Factory method to create a {@linkcode setParams} method that will
 * automatically receive the {@linkcode options} and {@linkcode Schema} type.
 *
 * @template Schema Key-value pair object, corresponding to name-value pair relationship of URLSearchParams
 * @param options Optional options for the {@linkcode FilterSearchParams} object created at runtime
 * @returns A higher-order {@linkcode setParams} method
 *
 * @example
 * <caption>With schema and options</caption>
 * type Schema = { foo: string };
 * export const setTypedParams = createParamSetter<Schema>({
 *   onSet(name, value) {
 *     console.log(`Set ${name} to ${value}!`)
 *   }
 * })
 *
 * // In another file
 * setTypedParams((params) => {
 *   params.set("foo", "bar")
 * })
 */
export function createParamSetter<Schema extends FilterSearchParamsSchema>(
  options?: FilterSearchParamsOptionsWithSchema<Schema>,
) {
  const factoryOptions = options;

  /**
   * Modifies the URL search params based off {@linkcode setParamsFn} and navigates to it
   * @param setParamsFn Function to that accepts a mutable params parameter and modifies it
   * @param pathname Optional pathname to override the default. Use `null` for default, which is `window.location.pathname`.
   * @param options Options object that is shallow-merged with the options object provided to {@linkcode createParamSetter}
   *
   * @example
   * <caption>Basic usage</caption>
   * setTypedParams((params) => {
   *   params.set("foo", "bar")
   * })
   */
  return function (
    setParamsFn: (params: FilterSearchParams<Schema>) => void,
    pathname: string | null = null,
    options?: FilterSearchParamsOptionsWithSchema<Schema>,
  ) {
    setParams<Schema>(setParamsFn, pathname, { ...factoryOptions, ...options });
  };
}
