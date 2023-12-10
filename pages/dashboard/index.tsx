import {
  Card,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

import ProfessorCard from '../../components/common/ProfessorCard/ProfessorCard';
import TopMenu from '../../components/common/topMenu/topMenu';
import { BarGraph } from '../../components/graph/BarGraph/BarGraph';
import SearchQuery, { Professor } from '../../modules/SearchQuery/SearchQuery';
import searchQueryEqual from '../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../modules/searchQueryLabel/searchQueryLabel';
import searchQueryURLParse from '../../modules/searchQueryURLParse/searchQueryURLParse';

export const Dashboard: NextPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<SearchQuery>({});
  useEffect(() => {
    if (router.isReady) {
      if (
        typeof router.query.searchTerm !== 'undefined' &&
        !Array.isArray(router.query.searchTerm)
      ) {
        setSearchTerm(searchQueryURLParse(router.query.searchTerm));
      }
    }
  }, [router.isReady, router.query.searchTerms]);

  return (
    <>
      <Head>
        <link
          rel="canonical"
          href="https://trends.utdnebula.com/dashboard"
          key="canonical"
        />
        <meta
          property="og:url"
          content="https://trends.utdnebula.com/dashboard"
        />
      </Head>
      <TopMenu />
      <Grid
        container
        component="main"
        wrap="wrap-reverse"
        className="grow p-4"
        spacing={2}
      >
        <Grid item xs={12} sm={6} md={4}>
          {'Professor cards'}
        </Grid>
        <Grid item xs={false} sm={6} md={8} className="w-full">
          {'Search Query Cards for ' +
            JSON.stringify(searchTerm) +
            ' and related classes after (collapsed so as not to fetch data yet)'}
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
