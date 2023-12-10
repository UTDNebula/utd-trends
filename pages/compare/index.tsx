import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import TopMenu from '../../components/common/topMenu/topMenu';
import SearchQuery from '../../modules/SearchQuery/SearchQuery';
import { searchQueryURLParseMultiple } from '../../modules/searchQueryURLParse/searchQueryURLParse';

export const Compare: NextPage = () => {
  const router = useRouter();
  const [searchTerms, setSearchTerms] = useState<SearchQuery[]>([]);
  useEffect(() => {
    if (router.isReady) {
      if (typeof router.query.searchTerms !== 'undefined') {
        setSearchTerms(searchQueryURLParseMultiple(router.query.searchTerms));
      }
    }
  }, [router.isReady, router.query.searchTerms]);

  return (
    <>
      <Head>
        <link
          rel="canonical"
          href="https://trends.utdnebula.com/compare"
          key="canonical"
        />
        <meta
          property="og:url"
          content="https://trends.utdnebula.com/compare"
        />
      </Head>
      <TopMenu />
      <div>
        {'searchTerms: ' + searchTerms.map((term) => JSON.stringify(term))}
      </div>
    </>
  );
};

export default Compare;
