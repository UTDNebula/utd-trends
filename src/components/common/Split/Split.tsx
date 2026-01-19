'use client';

import React, { useRef } from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from 'react-resizable-panels';

interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
  minLeft: number;
  minRight: number;
  defaultLeft: number;
}

/**
 * Split component to make a draggable left and right side
 */
export default function Split(props: Props) {
  const panelLRef = useRef<ImperativePanelHandle>(null);
  const panelRRef = useRef<ImperativePanelHandle>(null);
  // Resets RHS & LHS when double clicking handle
  const handleResizeDoubleClick = () => {
    panelLRef.current?.resize(props.defaultLeft);
  };

  return (
    <>
      <div className="sm:hidden">
        <div data-tutorial-id="RHS">{props.right}</div>
        <div data-tutorial-id="LHS">{props.left}</div>
      </div>
      <PanelGroup
        direction="horizontal"
        className="hidden sm:flex overflow-visible"
      >
        <Panel
          ref={panelLRef}
          minSize={props.minLeft}
          defaultSize={props.defaultLeft}
          data-tutorial-id="LHS"
        >
          {props.left}
        </Panel>
        <PanelResizeHandle
          className="mt-4 p-1 mx-1 w-0.5 rounded-full opacity-50 data-[resize-handle-state=drag]:opacity-100 transition ease-in-out bg-transparent hover:bg-royal dark:hover:bg-cornflower-300 data-[resize-handle-state=drag]:bg-royal dark:data-[resize-handle-state=drag]:bg-cornflower-300"
          onDoubleClick={handleResizeDoubleClick}
        />
        <Panel
          className="overflow-visible min-w-0"
          ref={panelRRef}
          minSize={props.minRight}
          defaultSize={100 - props.defaultLeft}
          data-tutorial-id="RHS"
        >
          {props.right}
        </Panel>
      </PanelGroup>
    </>
  );
}
