import { createContext } from 'react';

interface ReleaseData {
  id: number;
  name: string;
  published_at: string;
  body: string;
  html_url: string;
}

export interface Feature {
  id: string;
  version: string;
  date: string;
  content: string;
  releaseUrl: string;
  releaseId: string;
}

export type FetchState = 'done' | 'loading' | 'error';

/**
 * Extract features from GitHub release content
 */
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

/**
 * Function to fetch only the 2 most recent releases
 */
export const fetchReleases = async () => {
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

type WhatsNewContextType = {
  readFeatures: string[];
  latestFeatures: Feature[];
  unread: boolean;
  markFeatureAsRead: (featureId: string) => void;
  markAllFeaturesAsRead: () => void;
  state: FetchState | undefined;
};

/**
 * Context for WhatsNew. Provides list of features, read status, and functions to modify read status
 */
export const WhatsNewContext = createContext<WhatsNewContextType>({
  readFeatures: [],
  latestFeatures: [],
  unread: false,
  markFeatureAsRead: () => {},
  markAllFeaturesAsRead: () => {},
  state: undefined,
});
