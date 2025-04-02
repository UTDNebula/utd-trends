type GenericFetchedDataError<T> = {
  state: 'error';
  data?: T;
};
type GenericFetchedDataLoading = {
  state: 'loading';
};
type GenericFetchedDataDone<T> = {
  state: 'done';
  data: T;
};
export type GenericFetchedData<T> =
  | GenericFetchedDataError<T>
  | GenericFetchedDataLoading
  | GenericFetchedDataDone<T>;
