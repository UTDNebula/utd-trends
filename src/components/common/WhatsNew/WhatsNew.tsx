import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Badge, IconButton, Popover, Tooltip } from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import usePersistantState from '@/modules/usePersistantState';

interface ReleaseData {
  id: number;
  name: string;
  published_at: string;
  body: string;
  html_url: string;
}

interface Feature {
  id: string;
  version: string;
  date: string;
  content: string;
  releaseUrl: string;
  releaseId: string;
}

// Extract features from GitHub release content
const extractFeaturesFromRelease = (releaseBody: string): string[] => {
  const lines = releaseBody.split('\n');
  const features: string[] = [];

  let inOverviewSection = true;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('## ')) {
      inOverviewSection = false;
      continue;
    }

    if (
      inOverviewSection &&
      (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* '))
    ) {
      const featureContent = trimmedLine.replace(/^[-*]\s+/, '').trim();
      if (featureContent) {
        features.push(featureContent);
      }
    }
  }

  if (features.length === 0) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        features.push(trimmed);
        break;
      }
    }
  }

  return features;
};

// Function to fetch only the 2 most recent releases
const fetchReleases = async () => {
  return fetch(
    'https://api.github.com/repos/UTDNebula/utd-trends/releases?per_page=2',
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`GitHub API responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then((response) => {
      if (!Array.isArray(response) || response.length === 0) {
        throw new Error('GitHub API responded with not known format');
      }

      const allFeatures: Feature[] = [];

      response.forEach((release: ReleaseData) => {
        if (release && release.body) {
          const extractedFeatures = extractFeaturesFromRelease(release.body);
          const featureVersion = release.name;
          const featureDate = new Date(release.published_at).toLocaleDateString(
            'en-US',
            {
              month: 'short',
              day: 'numeric',
            },
          );

          if (extractedFeatures.length > 0) {
            // Get only the first feature from the latest release
            const featureContent = extractedFeatures[0];
            const id = `${release.id}-0`;

            const newFeature = {
              id,
              version: featureVersion,
              date: featureDate,
              content: featureContent,
              releaseUrl: release.html_url,
              releaseId: release.id.toString(),
            };
            allFeatures.push(newFeature);
          }
        }
      });

      return allFeatures;
    });
};

/**
 * WhatsNewButton component that shows the latest feature from GitHub releases
 */
export function WhatsNewButton() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [readFeatures, setReadFeatures] = usePersistantState<string[]>(
    'readFeatures',
    [],
  );
  const [latestFeatures, setLatestFeatures] = useState<Feature[]>([]);
  const [state, setState] = useState('done');

  // Check if the latest feature is unread
  const unread = Boolean(
    latestFeatures.find((feature) => !readFeatures.includes(feature.id)),
  );
  const open = Boolean(anchorEl);

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
    <>
      <Tooltip title="See What's New in Trends!">
        <IconButton
          className="aspect-square"
          size="medium"
          onClick={handleClick}
          aria-describedby="whats-new-popover"
        >
          {unread ? (
            <Badge color="primary" badgeContent=" ">
              <InfoOutlinedIcon className="text-3xl" />
            </Badge>
          ) : (
            <InfoOutlinedIcon className="text-3xl" />
          )}
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
        <h3 className="font-bold mb-3 text-base text-center">
          What&apos;s New?
        </h3>
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
                    className="flex flex-col gap-1 hover:bg-gray-100 dark:hover:bg-cornflower-700 p-2 rounded-md transition-colors"
                  >
                    <div className="flex justify-between">
                      <span
                        className={`text-xs rounded-full ${readFeatures.includes(feature.id) ? 'ring-1 ring-cornflower-500 text-cornflower-700 dark:ring-cornflower-400 dark:text-cornflower-200' : 'bg-cornflower-600 text-white dark:bg-cornflower-300 dark:text-cornflower-900'} p-0.5 px-2`}
                      >
                        {feature.version}
                      </span>
                      <p className="text-xs text-cornflower-500 dark:text-cornflower-400 mr-2">
                        {feature.date}
                      </p>
                    </div>
                    <p className="text-sm ml-0.5">{feature.content}</p>
                  </Link>,
                  latestFeatures.length - 1 !== index ? (
                    <hr
                      key={feature.id + 'divider'}
                      className="border-gray-300 dark:border-gray-600"
                    />
                  ) : null,
                ])}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No updates available
              </p>
            )))}
      </Popover>
    </>
  );
}

export default WhatsNewButton;
