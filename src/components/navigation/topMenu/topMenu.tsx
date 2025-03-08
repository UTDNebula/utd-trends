import { Campaign, Share } from '@mui/icons-material';
import { IconButton, Snackbar, Tooltip } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef,useState } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';

import Background from '@/../public/background.png';
import tailwindConfig from '@/../tailwind.config.js';
import SearchBar from '@/components/search/SearchBar/searchBar';


/**
 * Props type used by the TopMenu component
 */
interface TopMenuProps {
  resultsLoading: 'loading' | 'done' | 'error';
  setResultsLoading: () => void;
}

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
 * This is a component to hold UTD Trends branding and basic navigation
 */
export function TopMenu({ resultsLoading, setResultsLoading }: TopMenuProps) {
  const router = useRouter();
  const [openCopied, setOpenCopied] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [wasOpened, setWasOpened] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  // Count unread features for notification badge
  const unreadCount = features.filter(feature => !feature.read).length;

  // Load features from localStorage on initial render
  useEffect(() => {
    const savedFeatures = localStorage.getItem('utdTrendsFeatures');
    if (savedFeatures) {
      setFeatures(JSON.parse(savedFeatures));
    }
  }, []);

  // Save features to localStorage whenever they change
  useEffect(() => {
    if (features.length > 0) {
      localStorage.setItem('utdTrendsFeatures', JSON.stringify(features));
    }
  }, [features]);

  // Fetch releases on component mount
  useEffect(() => {
    fetchReleases();
  }, []);

  // Position the dropdown centered under the icon
  useEffect(() => {
    if (whatsNewOpen && dropdownRef.current && iconRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const dropdownWidth = dropdownRef.current.offsetWidth;
      const iconCenter = iconRect.left + iconRect.width / 2;
      const leftPosition = iconCenter - dropdownWidth / 2;
      
      // Ensure the dropdown doesn't go off-screen
      const windowWidth = window.innerWidth;
      const finalLeft = Math.max(4, Math.min(windowWidth - dropdownWidth - 4, leftPosition));
      
      dropdownRef.current.style.left = `${finalLeft}px`;
    }
  }, [whatsNewOpen]);

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
      
      if (inOverviewSection && (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* '))) {
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

  // Function to fetch the recent releases
  const fetchReleases = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('https://api.github.com/repos/UTDNebula/utd-trends/releases?per_page=4');
      
      if (!response.ok) {
        throw new Error(`GitHub API responded with status: ${response.status}`);
      }
      
      const releases = await response.json() as ReleaseData[];
      
      if (!Array.isArray(releases) || releases.length === 0) {
        return;
      }
      
      const allFeatures: Feature[] = [];
      
      releases.forEach((release: ReleaseData) => {
        if (release && release.body) {
          const extractedFeatures = extractFeaturesFromRelease(release.body);
          
          extractedFeatures.forEach(content => {
            const id = `${release.id}-${allFeatures.length}`;
            allFeatures.push({
              id,
              content,
              read: false,
              releaseUrl: release.html_url,
              releaseId: release.id.toString()
            });
          });
        }
      });
      
      if (allFeatures.length > 0) {
        setFeatures(allFeatures);
      }
      
    } catch (error) {
      console.error('Error fetching release data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Close the dropdown and mark features as read
  const closeDropdown = () => {
    if (whatsNewOpen) {
      if (wasOpened) {
        markAllAsRead();
        setWasOpened(false);
      }
      setWhatsNewOpen(false);
    }
  };

  // Toggle the What's New dropdown
  const toggleWhatsNew = () => {
    const newState = !whatsNewOpen;
    
    if (newState) {
      setWasOpened(true);
    } 
    else if (wasOpened) {
      markAllAsRead();
      setWasOpened(false);
    }
    
    setWhatsNewOpen(newState);
  };

  // Mark a feature as read
  const markFeatureAsRead = (featureId: string) => {
    setFeatures(prevFeatures => 
      prevFeatures.map(feature => 
        feature.id === featureId ? {...feature, read: true} : feature
      )
    );
  };

  // Mark all features as read
  const markAllAsRead = () => {
    setFeatures(prevFeatures => 
      prevFeatures.map(feature => ({...feature, read: true}))
    );
  };

  // Navigate to the release page
  const navigateToRelease = (feature: Feature, e: React.MouseEvent) => {
    e.stopPropagation();
    markFeatureAsRead(feature.id);
    window.open(feature.releaseUrl, '_blank');
  };

  // Handle keyboard events for accessibility
  const handleKeyPress = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
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

  return (
    <>
      <div className="relative overflow-hidden flex items-center gap-y-0 gap-x-4 md:gap-x-8 lg:gap-x-16 py-1 md:py-2 px-4 md:px-8 lg:px-16 bg-lighten dark:bg-darken flex-wrap sm:flex-nowrap">
        <Image
          src={Background}
          alt="gradient background"
          fill
          className="object-cover -z-20"
          priority
        />
        <Link
          href="/"
          className="text-lg md:text-xl font-kallisto font-medium md:font-bold"
        >
          UTD TRENDS
        </Link>
        <SearchBar
          manageQuery="onSelect"
          resultsLoading={resultsLoading}
          setResultsLoading={setResultsLoading}
          className="order-last basis-full sm:order-none sm:basis-[32rem] shrink"
          input_className="[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
        />

        <div className="relative inline-block ml-auto">
          <Tooltip title="What's New">
            <IconButton
              ref={iconRef}
              className="aspect-square"
              size="medium"
              onClick={toggleWhatsNew}
              aria-expanded={whatsNewOpen}
              aria-haspopup="true"
            >
              <Campaign className="text-4xl mr-1" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-royal text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </IconButton>
          </Tooltip>
          
          {whatsNewOpen && (
            <>
              <div 
                className="fixed inset-0 z-[999]"
                onClick={closeDropdown}
                onKeyDown={(e) => handleKeyPress(e, closeDropdown)}
                role="button"
                tabIndex={0}
                aria-label="Close dropdown overlay"
              ></div>
              
              <div 
                ref={dropdownRef}
                className="fixed mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-[1000]"
                style={{
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  top: '4rem',
                  maxHeight: '80vh',
                  overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-label="What&apos;s New dialog"
              >
                <div className="p-4">
                  <h3 className="font-bold mb-3 text-base text-center">What&apos;s New?</h3>
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-royal"></div>
                    </div>
                  ) : features.length > 0 ? (
                    <ul className="space-y-3">
                      {features.map((feature) => (
                        <li 
                          key={feature.id} 
                          className="flex items-start group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md transition-colors"
                          onClick={(e) => navigateToRelease(feature, e)}
                          onKeyDown={(e) => handleKeyPress(e, () => navigateToRelease(feature, e as unknown as React.MouseEvent))}
                          role="button"
                          tabIndex={0}
                          title="Click to view release details"
                        >
                          <div className="w-4 flex-shrink-0 inline-block">
                            {!feature.read && (
                              <div className="mt-1 h-3 w-3 rounded-full bg-royal"></div>
                            )}
                          </div>
                          <span className="text-sm">{feature.content}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No updates available</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <Tooltip title="Share link to search">
          <IconButton
            className="aspect-square"
            size="medium"
            onClick={() => {
              let url = window.location.href;
              if (
                router.query &&
                Object.keys(router.query).length === 0 &&
                Object.getPrototypeOf(router.query) === Object.prototype
              ) {
                url = 'https://trends.utdnebula.com/';
              }
              shareLink(url);
            }}
          >
            <Share className="text-3xl mr-1" />
          </IconButton>
        </Tooltip>
      </div>
      <Snackbar
        open={openCopied}
        autoHideDuration={6000}
        onClose={() => setOpenCopied(false)}
        message="Copied!"
      />
    </>
  );
}

export default TopMenu;