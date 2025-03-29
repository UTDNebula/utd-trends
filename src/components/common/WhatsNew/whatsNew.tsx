import { Campaign } from '@mui/icons-material';
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
  const [latestFeature, setLatestFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(false);
  const [wasOpened, setWasOpened] = useState(false);

  // Check if the latest feature is unread
  const hasUnreadFeature = latestFeature && !latestFeature.read;
  const open = Boolean(anchorEl);
  const id = open ? 'whats-new-popover' : undefined;

  // Load feature from localStorage
  useEffect(() => {
    const savedFeature = localStorage.getItem('utdTrendsLatestFeature');
    if (savedFeature) {
      setLatestFeature(JSON.parse(savedFeature));
    }
  }, []);

  // Save feature to localStorage whenever it changes
  useEffect(() => {
    if (latestFeature) {
      localStorage.setItem(
        'utdTrendsLatestFeature',
        JSON.stringify(latestFeature),
      );
    }
  }, [latestFeature]);

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

  // Function to fetch only the most recent release
  const fetchReleases = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        'https://api.github.com/repos/UTDNebula/utd-trends/releases?per_page=1',
      );

      if (!response.ok) {
        throw new Error(`GitHub API responded with status: ${response.status}`);
      }

      const releases = (await response.json()) as ReleaseData[];

      if (!Array.isArray(releases) || releases.length === 0) {
        return;
      }

      const release = releases[0]; // Get only the most recent release

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
          const savedFeature = localStorage.getItem('utdTrendsLatestFeature');
          if (savedFeature) {
            const parsedFeature = JSON.parse(savedFeature) as Feature;

            // If it's the same feature, keep the read status
            if (parsedFeature.id === id) {
              newFeature.read = parsedFeature.read;
            }
          }

          setLatestFeature(newFeature);
        }
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
    if (wasOpened && latestFeature) {
      markFeatureAsRead();
      setWasOpened(false);
    }
    setAnchorEl(null);
  };

  // Mark the feature as read
  const markFeatureAsRead = () => {
    if (latestFeature) {
      setLatestFeature({
        ...latestFeature,
        read: true,
      });
    }
  };

  // Navigate to the release page
  const navigateToRelease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (latestFeature) {
      markFeatureAsRead();
      window.open(latestFeature.releaseUrl, '_blank');
      handleClose();
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
          <Campaign className="text-4xl mr-1" />
          {hasUnreadFeature && (
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
            ) : latestFeature ? (
              <div className="space-y-3">
                <button
                  className="flex items-start group w-full text-left hover:bg-gray-100 dark:hover:bg-cornflower-700 p-1 rounded-md transition-colors"
                  onClick={navigateToRelease}
                  title="Click to view release details"
                >
                  <div className="w-4 flex-shrink-0 inline-block">
                    {!latestFeature.read && (
                      <div className="mt-1 h-3 w-3 rounded-full bg-royal"></div>
                    )}
                  </div>
                  <span className="text-sm">{latestFeature.content}</span>
                </button>
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
