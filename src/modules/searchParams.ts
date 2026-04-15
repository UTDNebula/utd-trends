import FilterSearchParams, {
  type FilterSearchParamsOptionsWithSchema,
  type FilterSearchParamsSchema,
} from './FilterSearchParams';

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
 * @param options Optional options for the {@linkcode FilterSearchParams} object created at runtime
 */
export const setParams = <
  Schema extends FilterSearchParamsSchema = FilterSearchParamsSchema,
>(
  setParamsFn: (params: FilterSearchParams<Schema>) => void,
  pathname: string = window.location.pathname,
  options: FilterSearchParamsOptionsWithSchema<Schema> = {},
) => {
  const params = new FilterSearchParams<Schema>(
    window.location.search,
    options,
  );
  setParamsFn(params);
  navigateWithParams(pathname, params);
};

/**
 * Creates an object with a {@linkcode ParamSetter.setParams | setParams} method.
 * The method will automatically receive this {@linkcode ParamSetter} object's
 * {@linkcode options} and {@linkcode Schema} type.
 *
 * @template Schema
 * @param options Optional options for the {@linkcode FilterSearchParams} object created at runtime
 */
export class ParamSetter<Schema extends FilterSearchParamsSchema> {
  private options: FilterSearchParamsOptionsWithSchema<Schema> = {};

  constructor(options?: FilterSearchParamsOptionsWithSchema<Schema>) {
    if (options) this.options = options;
    this.setParams = this.setParams.bind(this);
  }

  /**
   * Modifies the URL search params based off {@linkcode setParamsFn} and navigates to it
   * @param setParamsFn Function to that accepts a mutable params parameter and modifies it
   * @param pathname Optional pathname to override the default, which uses `window.location.pathname`
   */
  setParams(
    setParamsFn: (params: FilterSearchParams<Schema>) => void,
    pathname: string = window.location.pathname,
  ) {
    setParams<Schema>(setParamsFn, pathname, this.options);
  }
}
