'use client';

import WhatsNew from '@/components/common/WhatsNew/WhatsNew';
import Tutorial from '@/components/dashboard/Tutorial/Tutorial';
import PlannerButton from '@/components/planner/PlannerButton/PlannerButton';
import DownloadIcon from '@mui/icons-material/Download';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import html2canvas from 'html2canvas-pro';
import { useCallback, useEffect, useState } from 'react';
import { type HeaderProps } from './Header';

export default function HeaderChildren(props: HeaderProps) {
  const [openCopied, setOpenCopied] = useState(false);

  function shareLink(url: string) {
    if (navigator.share) {
      navigator
        .share({
          title: 'UTD Trends',
          url: url,
        })
        .catch(() => copyLink(url));
    } else {
      copyLink(url);
    }
  }

  function copyLink(url: string) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => setOpenCopied(true))
        .catch(() => alertLink(url));
    } else {
      alertLink(url);
    }
  }

  function alertLink(url: string) {
    alert(url);
  }

  const [openTutorial, setOpenTutorial] = useState(false);
  const closeTutorial = useCallback(() => setOpenTutorial(false), []);
  const [tutorialHint, setTutorialHint] = useState(false);

  // Open if not already closed (based on localStorage)
  useEffect(() => {
    const previous = localStorage.getItem('tutorialHint');
    let ask = previous === null;
    if (previous !== null) {
      const parsed = JSON.parse(previous);
      if (parsed !== null && parsed.value !== 'opened') {
        ask = true;
      }
    }
    if (ask) {
      setTutorialHint(true);
    }
  }, []);
  const cacheIndex = 0; // Increment this to open the popup for all users on next deployment

  const [dashboardSearchTerms, setDashboardSearchTerms] = useState<
    null | string
  >(null);

  useEffect(() => {
    setDashboardSearchTerms(
      window.sessionStorage.getItem('dashboardSearchTerms'),
    );
  }, []);

  const plannerButtonProps = {
    isPlanner: props.isPlanner,
    href: props.isPlanner
      ? dashboardSearchTerms != null
        ? '/dashboard?' + dashboardSearchTerms
        : '/dashboard?availability=true'
      : '/planner',
    onClick: () =>
      !props.isPlanner
        ? sessionStorage.setItem(
            'dashboardSearchTerms',
            new URLSearchParams(window.location.search).toString(),
          )
        : null,
  };

  return (
    <>
      <div className="flex gap-x-2 sm:hidden">
        {/* When PlannerButton is moved to a bottom nav bar, remove the small size props from all the children in this div */}
        <PlannerButton {...plannerButtonProps} size="small" />
        <IconButton size="small">
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </div>
      <div className="flex gap-x-2 max-sm:hidden">
        <PlannerButton {...plannerButtonProps} />
        <div className="flex gap-x-4">
          <div className="ml-auto">
            <WhatsNew />
          </div>
          {!props.isPlanner && (
            <div className="relative">
              <div
                className={
                  tutorialHint
                    ? 'absolute w-11 h-11 rounded-full bg-royal dark:bg-cornflower-300 animate-ping'
                    : 'hidden'
                }
              />
              <div
                className={
                  tutorialHint
                    ? ' rounded-full bg-royal dark:bg-cornflower-300'
                    : ''
                }
              >
                <Tooltip title="Open Tutorial">
                  <IconButton
                    className="aspect-square"
                    size="medium"
                    onClick={() => {
                      setTutorialHint(false);
                      localStorage.setItem(
                        'tutorialHint',
                        JSON.stringify({
                          value: 'opened',
                          cacheIndex: cacheIndex,
                        }),
                      );
                      setOpenTutorial(true);
                    }}
                  >
                    <HelpOutlineIcon
                      className={
                        'text-3xl' + (tutorialHint ? ' text-white' : '')
                      }
                    />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          )}
          <Tooltip
            title={`${props.isPlanner ? 'Download your Schedule' : 'Share link to Search'}`}
          >
            {props.isPlanner ? (
              <IconButton
                className="aspect-square"
                size="medium"
                onClick={() => {
                  const refObj = props.downloadRef;
                  if (!refObj) {
                    return;
                  }
                  if (!refObj.current) {
                    return;
                  }

                  html2canvas(refObj.current).then(
                    (canvasImg: HTMLCanvasElement) => {
                      const linkTag = document.createElement('a');

                      canvasImg.toBlob((blob) => {
                        if (!blob) {
                          return;
                        }
                        if (refObj.current === null) {
                          return;
                        }

                        const imgURL = URL.createObjectURL(blob);
                        linkTag.href = imgURL;
                        linkTag.download = 'schedule.png';

                        // Adding temp a tag for the download functionality (alternative to adding an api route handler)

                        document.body.appendChild(linkTag);
                        linkTag.click();
                        document.body.removeChild(linkTag);

                        // Removing ref to the object url

                        URL.revokeObjectURL(imgURL);
                      });
                    },
                  );
                }}
              >
                <DownloadIcon className="text-3xl mt-0.5" />
              </IconButton>
            ) : (
              <IconButton
                className="aspect-square"
                size="medium"
                onClick={() => {
                  let url = window.location.href;
                  if (
                    new URLSearchParams(window.location.search).toString() ===
                    ''
                  ) {
                    url = 'https://trends.utdnebula.com/';
                  }
                  shareLink(url);
                }}
              >
                <ShareIcon className="text-3xl mr-0.5 -ml-0.5" />
              </IconButton>
            )}
          </Tooltip>
        </div>
      </div>
      <Snackbar
        open={openCopied}
        autoHideDuration={6000}
        onClose={() => setOpenCopied(false)}
        message="Copied!"
      />
      <Tutorial open={openTutorial} close={closeTutorial} />
    </>
  );
}
