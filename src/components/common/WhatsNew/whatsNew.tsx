import InfoIcon from '@mui/icons-material/Info';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Popover, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface ReleaseData {
  id: number;
  body: string;
  html_url: string;
}

interface Feature {
  id: string;
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

          if (extractedFeatures.length > 0) {
            // Get only the first feature from the latest release
            const featureContent = extractedFeatures[0];
            const id = `${release.id}-0`;

            const newFeature = {
              id,
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
      <Tooltip title="What's New">
        <IconButton
          className="aspect-square"
          size="medium"
          onClick={handleClick}
          aria-describedby={id}
        >
          <InfoIcon className="text-4xl mr-1 hidden dark:block" />
          <InfoOutlinedIcon className="text-4xl mr-1 dark:hidden" />
          {unreadCount > 0 && (
            <span className="absolute -top-0 -right-0 bg-royal rounded-full h-3 w-3"></span>
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
        <div
          className="w-64 bg-white dark:bg-[#242643] rounded-md"
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
                    className="flex items-start group w-full text-left hover:bg-gray-100 dark:hover:bg-cornflower-700 p-1 rounded-md transition-colors"
                    onClick={(e) =>
                      navigateToRelease(feature, e as React.MouseEvent)
                    }
                    title="Click to view release details"
                    key={feature.id}
                  >
                    <div className="w-4 flex-shrink-0 inline-block">
                      {!feature.read && (
                        <div className="mt-1 h-3 w-3 rounded-full bg-royal"></div>
                      )}
                    </div>
                    <span className="text-sm">{feature.content}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No updates available
              </p>
            )}
          </div>
        </div>
      </Popover>
    </>
  );
}

export default WhatsNewButton;
