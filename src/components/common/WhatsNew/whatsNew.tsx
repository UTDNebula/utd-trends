import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Paper, Popover, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';

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
  read: boolean;
  releaseUrl: string;
  releaseId: string;
}

/**
 * WhatsNewButton component that shows the latest feature from GitHub releases
 */
export function WhatsNewButton() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [latestFeatures, setLatestFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [wasOpened, setWasOpened] = useState(false);

  // Check if the latest feature is unread
  const unreadCount = latestFeatures.filter((feature) => !feature.read).length;
  const open = Boolean(anchorEl);
  const id = open ? 'whats-new-popover' : undefined;

  // Load features from localStorage
  useEffect(() => {
    const savedFeatures = localStorage.getItem('utdTrendsLatestFeatures');
    if (savedFeatures) {
      setLatestFeatures(JSON.parse(savedFeatures));
    }
  }, []);

  // Save features to localStorage whenever it changes
  useEffect(() => {
    if (latestFeatures.length > 0) {
      localStorage.setItem(
        'utdTrendsLatestFeatures',
        JSON.stringify(latestFeatures),
      );
    }
  }, [latestFeatures]);

  // Fetch releases
  useEffect(() => {
    fetchReleases();
  }, []);

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
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        'https://api.github.com/repos/UTDNebula/utd-trends/releases?per_page=2',
      );

      if (!response.ok) {
        throw new Error(`GitHub API responded with status: ${response.status}`);
      }

      const releases = (await response.json()) as ReleaseData[];

      if (!Array.isArray(releases) || releases.length === 0) {
        return;
      }

      const allFeatures: Feature[] = [];

      releases.forEach((release: ReleaseData) => {
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
              read: false,
              releaseUrl: release.html_url,
              releaseId: release.id.toString(),
            };

            // Check if we already have this feature stored
            const savedFeature = localStorage.getItem(
              'utdTrendsLatestFeatures',
            );
            if (savedFeature) {
              const parsedFeature = (
                JSON.parse(savedFeature) as Feature[]
              ).filter((feature) => feature.id === id)[0];
              // If it's the same feature, keep the read status
              if (parsedFeature) {
                newFeature.read = parsedFeature.read;
              }
            }
            allFeatures.push(newFeature);
          }
        }
      });

      if (allFeatures.length > 0) {
        setLatestFeatures(allFeatures);
      }
    } catch (error) {
      console.error('Error fetching release data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening the popover
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setWasOpened(true);
  };

  // Handle closing the popover
  const handleClose = () => {
    if (wasOpened && latestFeatures) {
      markAllFeaturesAsRead();
      setWasOpened(false);
    }
    setAnchorEl(null);
  };

  // Mark a feature as read
  const markFeatureAsRead = (featureId: string) => {
    setLatestFeatures((prevFeatures) =>
      prevFeatures.map((feature) =>
        feature.id === featureId ? { ...feature, read: true } : feature,
      ),
    );
  };

  // Mark all features as read
  const markAllFeaturesAsRead = () => {
    setLatestFeatures((prevFeatures) =>
      prevFeatures.map((feature) => ({ ...feature, read: true })),
    );
  };

  // Navigate to the release page
  const navigateToRelease = (feature: Feature, e: React.MouseEvent) => {
    e.stopPropagation();
    if (feature) {
      markFeatureAsRead(feature.id);
      window.open(feature.releaseUrl, '_blank');
      // handleClose();
    }
  };

  return (
    <>
      <Tooltip title="See What's New in Trends!">
        <IconButton
          className="aspect-square"
          size="medium"
          onClick={handleClick}
          aria-describedby={id}
        >
          <InfoOutlinedIcon className="text-3xl" />
          {unreadCount > 0 && (
            <span className="absolute -top-0 -right-0 bg-royal dark:bg-cornflower-300 rounded-full h-3 w-3"></span>
          )}
        </IconButton>
      </Tooltip>

      <Popover
        id={id}
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
      >
        <Paper
          className="w-64 bg-white dark:bg-haiti rounded-md"
          elevation={6}
          style={{
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <div className="p-4">
            <h3 className="font-bold mb-3 text-base text-center">
              What&apos;s New?
            </h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-royal"></div>
              </div>
            ) : latestFeatures.length > 0 ? (
              <div className="space-y-3">
                {latestFeatures.map((feature) => (
                  <button
                    className="flex items-start group w-full text-left hover:bg-gray-100 dark:hover:bg-cornflower-700 p-1 pl-3 rounded-md transition-colors"
                    onClick={(e) =>
                      navigateToRelease(feature, e as React.MouseEvent)
                    }
                    title="Click to view release details"
                    key={feature.id}
                  >
                    <div className="flex flex-col">
                      <div className="flex justify-between">
                        <span
                          className={`text-xs rounded-full ${!feature.read ? 'bg-cornflower-600 text-white dark:bg-cornflower-300 dark:text-cornflower-900' : 'ring-1 ring-cornflower-500 text-cornflower-700 dark:ring-cornflower-400 dark:text-cornflower-200'} p-0.5 px-2`}
                        >
                          {feature.version}
                        </span>
                        <span className="text-xs text-cornflower-500 dark:text-cornflower-400 mr-2">
                          {feature.date}
                        </span>
                      </div>
                      <span className="text-sm ml-0.5 mt-1">
                        {feature.content}
                      </span>
                      <hr className=" mt-2 border-gray-300 dark:border-gray-600" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No updates available
              </p>
            )}
          </div>
        </Paper>
      </Popover>
    </>
  );
}

export default WhatsNewButton;
