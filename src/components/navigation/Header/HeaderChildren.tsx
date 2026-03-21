'use client';

import {
  WhatsNewBadge,
  WhatsNewButton,
  WhatsNewModal,
  WhatsNewProvider,
} from '@/components/common/WhatsNew/WhatsNew';
import Tutorial, {
  TutorialButton,
  TutorialContext,
  TutorialProvider,
} from '@/components/dashboard/Tutorial/Tutorial';
import PlannerButton from '@/components/planner/PlannerButton/PlannerButton';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareIcon from '@mui/icons-material/Share';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import html2canvas from 'html2canvas-pro';
import { useCallback, useContext, useEffect, useState } from 'react';
import { type HeaderProps } from './Header';

export default function HeaderChildren(props: HeaderProps) {
  return (
    <WhatsNewProvider>
      <TutorialProvider>
        <HeaderChildrenInner {...props} />
      </TutorialProvider>
    </WhatsNewProvider>
  );
}

function HeaderChildrenInner(props: HeaderProps) {
  const [openCopied, setOpenCopied] = useState(false);

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const openMenu = Boolean(menuAnchorEl);

  const { tutorialHint } = useContext(TutorialContext);

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleClickDownload = () => {
    const refObj = props.downloadRef;
    if (!refObj) {
      return;
    }
    if (!refObj.current) {
      return;
    }

    html2canvas(refObj.current).then((canvasImg: HTMLCanvasElement) => {
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
    });
  };

  const handleClickShare = () => {
    let url = window.location.href;
    if (new URLSearchParams(window.location.search).toString() === '') {
      url = 'https://trends.utdnebula.com/';
    }
    shareLink(url);
  };

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

  const [openWhatsNewModal, setOpenWhatsNewModal] = useState(false);
  const closeWhatsNewModal = useCallback(() => setOpenWhatsNewModal(false), []);

  const [dashboardSearchTerms, setDashboardSearchTerms] = useState<
    null | string
  >(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const tutorialButton = <TutorialButton handleCloseMenu={handleCloseMenu} />;

  const moreVertIcon = (
    <div className="relative w-fit h-fit">
      <div
        className={
          tutorialHint && !openMenu && !props.isPlanner
            ? 'absolute w-full h-full rounded-full bg-royal dark:bg-cornflower-300 animate-ping'
            : 'hidden'
        }
      />
      <div
        className={
          tutorialHint && !openMenu && !props.isPlanner
            ? ' rounded-full bg-royal dark:bg-cornflower-300'
            : ''
        }
      >
        <IconButton
          id="header-menu-button"
          size="small"
          aria-controls={openMenu ? 'header-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openMenu ? 'true' : undefined}
          onClick={(e) => {
            setMenuAnchorEl(e.currentTarget);
          }}
        >
          <MoreVertIcon
            fontSize="small"
            className={`${tutorialHint && !openMenu && !props.isPlanner ? ' text-white dark:text-haiti' : ''}`}
          />
        </IconButton>
      </div>
    </div>
  );

  return (
    <>
      {/* Shown on small screens */}
      <div className="flex gap-x-2 sm:hidden">
        {/* TODO: When PlannerButton is moved to a bottom nav bar, remove the small size props from all the children in this div */}
        <PlannerButton {...plannerButtonProps} size="small" />
        {tutorialHint && !props.isPlanner ? (
          moreVertIcon
        ) : (
          <WhatsNewBadge>{moreVertIcon}</WhatsNewBadge>
        )}
      </div>

      {/* Shown on large screens */}
      <div className="flex gap-x-4 max-sm:hidden">
        {/* Planner button */}
        <PlannerButton {...plannerButtonProps} />

        {/* Whats new button */}
        <div className="ml-auto">
          <WhatsNewButton />
        </div>

        {/* Tutorial button */}
        {!props.isPlanner && tutorialButton}

        {/* Share/download button */}
        <Tooltip
          title={`${props.isPlanner ? 'Download your Schedule' : 'Share link to Search'}`}
        >
          {props.isPlanner ? (
            <IconButton
              className="aspect-square"
              size="medium"
              onClick={handleClickDownload}
            >
              <DownloadIcon className="text-3xl mt-0.5" />
            </IconButton>
          ) : (
            <IconButton
              className="aspect-square"
              size="medium"
              onClick={handleClickShare}
            >
              <ShareIcon className="text-3xl mr-0.5 -ml-0.5" />
            </IconButton>
          )}
        </Tooltip>
      </div>
      <Menu
        id="header-menu"
        open={openMenu}
        anchorEl={menuAnchorEl}
        onClose={handleCloseMenu}
        slotProps={{
          list: {
            'aria-labelledby': 'header-menu-button',
          },
        }}
        className="w-80 max-w-full"
      >
        <MenuItem
          onClick={() => {
            setOpenWhatsNewModal(true);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <WhatsNewBadge>
              <InfoOutlinedIcon />
            </WhatsNewBadge>
          </ListItemIcon>
          <ListItemText>What&apos;s new?</ListItemText>
        </MenuItem>

        {!props.isPlanner && tutorialButton}

        {props.isPlanner ? (
          <MenuItem
            onClick={() => {
              handleClickDownload();
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <DownloadIcon />
            </ListItemIcon>
            <ListItemText>Download schedule</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              handleClickShare();
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <ShareIcon />
            </ListItemIcon>
            <ListItemText>Copy link</ListItemText>
          </MenuItem>
        )}
      </Menu>
      <Snackbar
        open={openCopied}
        autoHideDuration={6000}
        onClose={() => setOpenCopied(false)}
        message="Copied!"
      />
      <WhatsNewModal open={openWhatsNewModal} onClose={closeWhatsNewModal} />
      <Tutorial />
    </>
  );
}
