type GenericFetchedDataError<T> = {
  message: string;
  data?: T;
};
type GenericFetchedDataDone<T> = {
  message: 'success';
  data: T;
};
export type GenericFetchedData<T> =
  | GenericFetchedDataError<T>
  | GenericFetchedDataDone<T>;
