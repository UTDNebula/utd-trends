//Increment these to reset cache on next deployment
export const cacheIndexNebula = 0;
export const cacheIndexRmp = 0;

export const expireTime = 604800; //1 week

function getCache(key: string, cacheIndex: number) {
  if (process.env.NODE_ENV !== 'development') {
    const item = localStorage.getItem(key);
    if (item !== null) {
      const parsedItem = JSON.parse(item);
      if (
        !('cacheIndex' in parsedItem) ||
        cacheIndex !== parsedItem.cacheIndex ||
        !('expiry' in parsedItem) ||
        new Date().getTime() > parsedItem.expiry ||
        !('value' in parsedItem)
      ) {
        localStorage.removeItem(key);
      } else {
        return parsedItem.value;
      }
    }
  }
  return false;
}

function setCache(
  key: string,
  cacheIndex: number,
  data: object,
  expireTime: number,
) {
  localStorage.setItem(
    key,
    JSON.stringify({
      value: data,
      expiry: new Date().getTime() + expireTime,
      cacheIndex: cacheIndex,
    }),
  );
}

function fetchWithCache(
  url: string,
  cacheIndex: number,
  expireTime: number,
  params: RequestInit | undefined = undefined,
  parseText = false,
) {
  const cacheKey = url + JSON.stringify(params);
  const cache = getCache(cacheKey, cacheIndex);
  if (cache) {
    return Promise.resolve(cache);
  }
  return fetch(url, params)
    .then((response) => {
      if (parseText) {
        return response.text();
      }
      return response.json();
    })
    .then((data) => {
      setCache(cacheKey, cacheIndex, data, expireTime);
      return data;
    });
}
export default fetchWithCache;
