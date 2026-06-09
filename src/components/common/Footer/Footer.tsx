'use client';

import DarkArrow from '@/../public/arrow-black.svg';
import LightArrow from '@/../public/arrow-white.svg';
import DarkGitHub from '@/../public/github-black.svg';
import LightGitHub from '@/../public/github-white.svg';
import DarkInsta from '@/../public/instagram-black.svg';
import LightInsta from '@/../public/instagram-white.svg';
import DarkDiscord from '@/../public/join-discord-black.svg';
import LightDiscord from '@/../public/join-discord-white.svg';
import DarkLinkedin from '@/../public/linkedin-black.svg';
import LightLinkedin from '@/../public/linkedin-white.svg';
import NebulaLogo from '@/components/icons/NebulaLogo/NebulaLogo';
import { UTDTrendsLogoCombination } from '@/components/icons/UTDTrendsLogo/UTDTrendsLogo';
import { Tooltip } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Contact logo that displays a light and dark version based on the current theme
 */
function Icon(props: {
  className?: string;
  light: string;
  dark: string;
  alt: string;
  size: number | `${number}`;
}) {
  return (
    <>
      <Image
        src={props.light}
        alt={props.alt}
        height={props.size}
        className={`block dark:hidden ${props.className || ''}`}
      />
      <Image
        src={props.dark}
        alt={props.alt}
        height={props.size}
        className={`hidden dark:block ${props.className || ''}`}
      />
    </>
  );
}

function ScrollUpButton() {
  return (
    <Tooltip title="Go back to top">
      <button
        onClick={() => window.scrollTo(0, 0)}
        className="flex flex-col items-center justify-center rounded-full p-2 transition border-2 border-white/0 hover:border-white dark:hover:border-haiti cursor-pointer"
      >
        <Icon
          className="rotate-180"
          light={LightArrow}
          dark={DarkArrow}
          alt="arrow"
          size="20"
        />
        Top
      </button>
    </Tooltip>
  );
}

const links = [
  {
    name: 'Resources',
    links: [
      { name: 'Galaxy', href: 'https://www.utdallas.edu/galaxy/' },
      {
        name: 'Academic Calendars',
        href: 'https://www.utdallas.edu/academics/calendar/',
      },
      {
        name: 'Advisors',
        href: 'https://oue.utdallas.edu/undergraduate-advising/ug-academic-advisors/',
      },
      { name: 'Career Center', href: 'https://career.utdallas.edu/' },
    ],
  },
  {
    name: 'Data',
    links: [
      { name: 'Nebula API', href: 'https://www.utdnebula.com/projects/api' },
      {
        name: 'Grades',
        href: 'https://github.com/UTDNebula/api-tools/tree/develop/static-data/grades',
      },
      {
        name: 'Rate My Professors',
        href: 'https://www.ratemyprofessors.com/school/1273',
      },
      { name: 'CourseBook', href: 'https://coursebook.utdallas.edu/' },
      { name: 'Profiles', href: 'https://profiles.utdallas.edu/' },
    ],
  },
  {
    name: 'Projects',
    links: [
      { name: 'Clubs', href: 'https://clubs.utdnebula.com/' },
      { name: 'Skedge', href: 'https://www.utdnebula.com/projects/skedge' },
      { name: 'Rooms', href: 'https://rooms.utdnebula.com/' },
      {
        name: 'API & Platform',
        href: 'https://www.utdnebula.com/projects/api',
      },
    ],
  },
];

const linkClasses =
  'underline decoration-transparent hover:decoration-inherit transition';

interface LinkGroupProps {
  name: string;
  links: {
    name: string;
    href: string;
  }[];
}

function LinkGroup({ name, links }: LinkGroupProps) {
  return (
    <div>
      <h3 className="text-md md:text-lg font-bold">{name}</h3>
      <div className="mt-6 flex flex-col items-start gap-5 text-sm md:text-base">
        {links.map(({ name, href }) => (
          <Link
            key={name + href}
            className={linkClasses}
            target={href.startsWith('http') ? '_blank' : undefined}
            href={href}
          >
            {name}
          </Link>
        ))}
      </div>
    </div>
  );
}

function GetToKnowUs() {
  return (
    <div className="flex flex-col items-start gap-5 text-sm md:text-base">
      <Link
        className={
          linkClasses +
          ' flex items-center gap-2 mb-2 hover:scale-105 transition'
        }
        target="_blank"
        href="https://discord.utdnebula.com/"
      >
        <Icon light={LightDiscord} dark={DarkDiscord} alt="Discord" size="45" />
      </Link>
      <Link
        className={linkClasses + ' flex items-center gap-2'}
        target="_blank"
        href="https://www.utdnebula.com/"
      >
        <NebulaLogo className="h-6 w-auto fill-white dark:fill-haiti" />
        Wesbite
      </Link>
      <Link
        className={linkClasses + ' flex items-center gap-2'}
        target="_blank"
        href="https://www.instagram.com/utdnebula/"
      >
        <Icon light={LightInsta} dark={DarkInsta} alt="Instagram" size="30" />
        Instagram
      </Link>
      <Link
        className={linkClasses + ' flex items-center gap-2'}
        target="_blank"
        href="https://www.linkedin.com/company/utdnebula/posts/?feedView=all"
      >
        <Icon
          light={LightLinkedin}
          dark={DarkLinkedin}
          alt="Linkedin"
          size="30"
        />
        Linkedin
      </Link>
      <Link
        className={linkClasses + ' flex items-center gap-2'}
        target="_blank"
        href="https://github.com/utdnebula/"
      >
        <Icon light={LightGitHub} dark={DarkGitHub} alt="Github" size="30" />
        Github
      </Link>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="lg:px-40 px-8 pt-6 bg-royal dark:bg-cornflower-300 text-white dark:text-haiti w-full">
      <div className="flex gap-8 justify-between items-center">
        {/* Logo */}
        <div className="font-display flex flex-row items-center gap-6">
          <UTDTrendsLogoCombination className="h-22 w-auto shrink-0 fill-white dark:fill-haiti" />
          <div className="flex flex-col max-sm:hidden">
            <span className="whitespace-nowrap text-4xl font-bold leading-tight">
              UTD TRENDS
            </span>
            <span className="whitespace-nowrap text-xl font-medium">
              by{' '}
              <Link
                target="_blank"
                href="https://www.utdnebula.com/"
                className="underline decoration-transparent hover:decoration-inherit transition decoration-2"
              >
                Nebula Labs
              </Link>
            </span>
          </div>
        </div>
        <ScrollUpButton />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10 mt-10">
        {links.map(({ name, links }) => (
          <LinkGroup key={name} name={name} links={links} />
        ))}
        <GetToKnowUs />
      </div>
      <div className="pb-6 mt-10">
        <div className="border-t-2 border-white dark:border-haiti" />
        <div className="flex md:flex-row flex-col gap-5 justify-between items-center pt-6">
          <div className="flex gap-x-8 gap-y-1 justify-around md:justify-normal flex-wrap">
            <Link
              className={linkClasses}
              href="https://www.utdnebula.com/legal/privacy-policy.txt"
            >
              Privacy Policy
            </Link>
            <Link className={linkClasses} href="/sitemap.xml">
              Sitemap
            </Link>
          </div>
          <p className="md:text-right text-center text-xs">
            © 2024-{new Date().getFullYear()} Nebula Labs Maintainers.
            Open-source under the MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
