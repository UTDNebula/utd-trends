'use client';

import usePersistantState from '@/modules/usePersistantState';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Modal, { type ModalProps } from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Link from 'next/link';
import React, { useContext, useEffect, useState, type ReactNode } from 'react';
import {
  fetchReleases,
  WhatsNewContext,
  type Feature,
  type FetchState,
} from './WhatsNewUtils';

type WhatsNewContentsProps = { onClose?: () => void };

/**
 * Info about the latest features from GitHub releases
 * - Should be a direct child of a {@linkcode Paper} component or similar
 * - Must be inside a {@linkcode WhatsNewProvider}
 */
export const WhatsNewContents = ({ onClose }: WhatsNewContentsProps) => {
  const { readFeatures, latestFeatures, markFeatureAsRead, state } =
    useContext(WhatsNewContext);

  return (
    <>
      <div className="flex items-center min-h-10 pb-2">
        <h3
          className={`font-bold text-base grow px-2 ${onClose ? '' : 'text-center'}`}
        >
          What&apos;s New?
        </h3>
        {onClose && (
          <div className="self-end">
            <IconButton onClick={onClose} aria-label="close modal">
              <CloseIcon />
            </IconButton>
          </div>
        )}
      </div>
      {(state === 'loading' && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-royal"></div>
        </div>
      )) ||
        (state === 'done' &&
          (latestFeatures.length > 0 ? (
            <div className="flex flex-col gap-2">
              {latestFeatures.flatMap((feature, index) => [
                <Link
                  key={feature.id}
                  href={feature.releaseUrl}
                  target="_blank"
                  onClick={() => markFeatureAsRead(feature.id)}
                  onAuxClick={(e) => {
                    if (e.button == 1) {
                      // middle click
                      markFeatureAsRead(feature.id);
                    }
                  }}
                  title="Click to view release details"
                  className="flex flex-col gap-1 hover:bg-gray-100 dark:hover:bg-gray-900 p-2 rounded-md transition-colors"
                >
                  <div className="flex justify-between">
                    <span
                      className={`text-xs rounded-full ${readFeatures.includes(feature.id) ? 'ring-1 ring-royal text-royal dark:ring-cornflower-300 dark:text-cornflower-300' : 'bg-royal text-white dark:bg-cornflower-300 dark:text-haiti'} p-0.5 px-2`}
                    >
                      {feature.version}
                    </span>
                    <p className="text-xs text-royal dark:text-cornflower-300 mr-2">
                      {feature.date}
                    </p>
                  </div>
                  <p className="text-sm ml-0.5">{feature.content}</p>
                </Link>,
                latestFeatures.length - 1 !== index && (
                  <Divider key={feature.id + 'divider'} />
                ),
              ])}
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No updates available
            </p>
          )))}
    </>
  );
};

/**
 * Button that opens a popover that contains {@linkcode WhatsNewContents}
 * - Must be inside a {@linkcode WhatsNewProvider}
 */
export function WhatsNewButton() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const { latestFeatures, markAllFeaturesAsRead } = useContext(WhatsNewContext);

  // Handle opening the popover
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the popover
  const handleClose = () => {
    if (anchorEl && latestFeatures) {
      markAllFeaturesAsRead();
    }
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="See What's New in Trends!">
        <IconButton
          className="aspect-square"
          size="medium"
          onClick={handleClick}
          aria-describedby="whats-new-popover"
        >
          <WhatsNewBadge>
            <InfoOutlinedIcon className="text-3xl" />
          </WhatsNewBadge>
        </IconButton>
      </Tooltip>

      <Popover
        id="whats-new-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            elevation: 6,
            className:
              'p-4 w-64 bg-white dark:bg-haiti rounded-md max-h-[80vh] overflow-y-auto',
          },
        }}
      >
        <WhatsNewContents />
      </Popover>
    </>
  );
}

type WhatsNewModalProps = Omit<ModalProps, 'children'> & {
  open: boolean;
  onClose?: () => void;
  className?: string;
  setUnread?: (value: boolean) => void;
};

/**
 * Modal containing {@linkcode WhatsNewContents}
 * - Must be controlled using props
 * - Must be inside a {@linkcode WhatsNewProvider}
 */
export function WhatsNewModal({
  open,
  onClose,
  className,
}: WhatsNewModalProps) {
  const { latestFeatures, markAllFeaturesAsRead } = useContext(WhatsNewContext);

  const handleClose = () => {
    if (open && latestFeatures) {
      markAllFeaturesAsRead();
    }
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className={`flex justify-center items-center h-screen p-4 ${className}`}
    >
      {/* This span is required to receive the tabIndex prop, which will let the user quickly navigate the modal using the keyboard */}
      <span>
        <Paper
          elevation={6}
          className="p-4 w-64 bg-white dark:bg-haiti rounded-md max-h-[80vh] overflow-y-auto"
        >
          <WhatsNewContents onClose={handleClose} />
        </Paper>
      </span>
    </Modal>
  );
}

/**
 * Conditionally adds a badge to its children depending on whether there are unread features
 * - Must be inside a {@linkcode WhatsNewProvider}
 */
export function WhatsNewBadge({ children }: { children: ReactNode }) {
  const { unread } = useContext(WhatsNewContext);

  if (unread) {
    return (
      <Badge color="primary" badgeContent=" ">
        {children}
      </Badge>
    );
  } else {
    return <>{children}</>;
  }
}

type WhatsNewProviderProps = {
  children: ReactNode;
};

/**
 * Fetches info about the latest features from GitHub releases, then provides this data to its children
 */
export function WhatsNewProvider({ children }: WhatsNewProviderProps) {
  const [readFeatures, setReadFeatures] = usePersistantState<string[]>(
    'readFeatures',
    [],
  );
  const [latestFeatures, setLatestFeatures] = useState<Feature[]>([]);
  const [state, setState] = useState<FetchState>('done');

  // Check if the latest feature is unread
  const unread = Boolean(
    latestFeatures.find((feature) => !readFeatures.includes(feature.id)),
  );

  // Fetch releases
  useEffect(() => {
    setState('loading');
    fetchReleases()
      .then((response) => {
        setLatestFeatures(response);
        setState('done');
      })
      .catch(() => setState('error'));
  }, []);

  // Mark a feature as read
  const markFeatureAsRead = (featureId: string) => {
    setReadFeatures(Array.from(new Set(readFeatures.concat([featureId]))));
  };

  // Mark all features as read
  const markAllFeaturesAsRead = () => {
    setReadFeatures(
      Array.from(
        new Set(
          readFeatures.concat(latestFeatures.map((feature) => feature.id)),
        ),
      ),
    );
  };

  return (
    <WhatsNewContext.Provider
      value={{
        readFeatures,
        latestFeatures,
        unread,
        markFeatureAsRead,
        markAllFeaturesAsRead,
        state,
      }}
    >
      {children}
    </WhatsNewContext.Provider>
  );
}
