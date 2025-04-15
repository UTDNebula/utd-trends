'use client';

import React, { type ReactNode, useRef } from 'react';
import {
  type ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';

interface Props {
  left: ReactNode;
  right: ReactNode;
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
          className="mt-4 p-1 mx-1 w-0.5 rounded-full opacity-25 data-[resize-handle-state=drag]:opacity-50 transition ease-in-out bg-transparent hover:bg-royal data-[resize-handle-state=drag]:bg-royal"
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
