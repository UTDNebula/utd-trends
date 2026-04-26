import React from 'react';
import Home from './Home';

export default async function Page() {
  if (process.env.NEXT_PUBLIC_DEBUG_LOADING === '1') {
    await new Promise<void>((resolve) => setTimeout(resolve, 30_000));
  }
  return <Home />;
}
