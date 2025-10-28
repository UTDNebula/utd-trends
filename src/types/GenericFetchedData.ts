type GenericFetchedDataError = {
  message: 'error';
  data?: string;
};
type GenericFetchedDataDone<T> = {
  message: 'success';
  data: T;
};
export type GenericFetchedData<T> =
  | GenericFetchedDataError
  | GenericFetchedDataDone<T>;
