'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function StickySide(props: Props) {
  return (
    <div className="sm:sticky sm:top-4 sm:max-h-[calc(100vh-2rem)] sm:overflow-y-auto sm:mt-4">
      {props.children}
    </div>
  );
}
