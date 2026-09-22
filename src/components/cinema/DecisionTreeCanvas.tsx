"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import styles from "./EnquiryDecisionTree.module.css";

export type CanvasDecision = {
  id: `D${number}`;
  owner: string;
  question: string;
  why: string;
  yes: string;
  yesNext: string;
  no: string;
  noNext: string;
  record: string;
};

export type CanvasStage = {
  number: string;
  title: string;
  purpose: string;
  decisions: CanvasDecision[];
};

type PositionedDecision = CanvasDecision & { x: number; y: number; centre: number; parentSource?: CanvasDecision["id"] };
type PositionedStage = CanvasStage & { x: number; y: number; width: number; height: number; firstDecision: CanvasDecision["id"] };

type CanvasProps = {
  ariaLabel: string;
  toolbarTitle: string;
  title: string;
  introduction: string;
  stages: CanvasStage[];
  finalTitle: string;
  finalCopy: string;
};

const DECISION_WIDTH = 540;
const DECISION_HEIGHT = 260;
const BRANCH_WIDTH = 430;
const BRANCH_HEIGHT = 220;
const ROW_HEIGHT = 680;
const STAGE_HEADER_HEIGHT = 320;
const STAGE_GAP = 300;
const FLOW_OFFSET = 520;
const SPLIT_OFFSET = 840;
const WORLD_WIDTH = 8400;

function getTarget(next: string) {
  return next.match(/D\d+/)?.[0] as CanvasDecision["id"] | undefined;
}

function createLayout(stages: CanvasStage[]) {
  const positionedStages: PositionedStage[] = [];
  const positionedDecisions: PositionedDecision[] = [];
  let y = 520;

  stages.forEach((stage) => {
    const indexById = new Map(stage.decisions.map((item, index) => [item.id, index]));
    const parentByTarget = new Map<CanvasDecision["id"], { source: CanvasDecision["id"]; branch: "yes" | "no" }>();

    stage.decisions.forEach((item, sourceIndex) => {
      ([["yes", item.yesNext], ["no", item.noNext]] as const).forEach(([branch, next]) => {
        const target = getTarget(next);
        const targetIndex = target ? indexById.get(target) : undefined;
        if (target && targetIndex !== undefined && targetIndex > sourceIndex && !parentByTarget.has(target)) {
          parentByTarget.set(target, { source: item.id, branch });
        }
      });
    });

    const childrenBySource = new Map<CanvasDecision["id"], Array<{ id: CanvasDecision["id"]; branch: "yes" | "no" }>>();
    parentByTarget.forEach((parent, target) => {
      const children = childrenBySource.get(parent.source) ?? [];
      children.push({ id: target, branch: parent.branch });
      childrenBySource.set(parent.source, children);
    });

    const relative = new Map<CanvasDecision["id"], { x: number; depth: number }>();
    let rootIndex = 0;
    stage.decisions.forEach((item) => {
      const parent = parentByTarget.get(item.id);
      if (!parent) {
        relative.set(item.id, { x: rootIndex * 1800, depth: 0 });
        rootIndex += 1;
        return;
      }

      const parentPosition = relative.get(parent.source) ?? { x: 0, depth: 0 };
      const siblings = childrenBySource.get(parent.source) ?? [];
      const direction = parent.branch === "yes" ? -1 : 1;
      const offset = direction * (siblings.length > 1 ? SPLIT_OFFSET : FLOW_OFFSET);
      relative.set(item.id, { x: parentPosition.x + offset, depth: parentPosition.depth + 1 });
    });

    const positions = [...relative.values()];
    const minimumX = Math.min(...positions.map((position) => position.x));
    const maximumX = Math.max(...positions.map((position) => position.x));
    const maximumDepth = Math.max(...positions.map((position) => position.depth));
    const stageWidth = maximumX - minimumX + 1500;
    const stageLeft = (WORLD_WIDTH - stageWidth) / 2;
    const stageHeight = STAGE_HEADER_HEIGHT + (maximumDepth + 1) * ROW_HEIGHT + 100;
    positionedStages.push({ ...stage, x: stageLeft, y, width: stageWidth, height: stageHeight, firstDecision: stage.decisions[0].id });

    stage.decisions.forEach((item) => {
      const position = relative.get(item.id) ?? { x: 0, depth: 0 };
      const centre = stageLeft + 750 + position.x - minimumX;
      positionedDecisions.push({
        ...item,
        x: centre - DECISION_WIDTH / 2,
        y: y + STAGE_HEADER_HEIGHT + position.depth * ROW_HEIGHT,
        centre,
        parentSource: parentByTarget.get(item.id)?.source,
      });
    });

    y += stageHeight + STAGE_GAP;
  });

  return { stages: positionedStages, decisions: positionedDecisions, byId: new Map(positionedDecisions.map((item) => [item.id, item])), height: y + 520 };
}

export default function DecisionTreeCanvas({ ariaLabel, toolbarTitle, title, introduction, stages, finalTitle, finalCopy }: CanvasProps) {
  const layout = useMemo(() => createLayout(stages), [stages]);
  const firstDecision = stages[0].decisions[0].id;
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; clientX: number; clientY: number; x: number; y: number } | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 0.82 });
  const viewRef = useRef(view);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<CanvasDecision["id"]>(firstDecision);

  function focusDecision(id: CanvasDecision["id"], scale = Math.max(viewRef.current.scale, 0.78)) {
    const node = layout.byId.get(id);
    const viewport = viewportRef.current;
    if (!node || !viewport) return;
    const rect = viewport.getBoundingClientRect();
    const nextScale = Math.min(Math.max(scale, 0.42), 1.35);
    const next = { x: rect.width / 2 - (node.x + DECISION_WIDTH / 2) * nextScale, y: 150 - node.y * nextScale, scale: nextScale };
    setSelected(id);
    viewRef.current = next;
    setView(next);
  }

  function fitOverview() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const scale = Math.max(Math.min((rect.width - 80) / WORLD_WIDTH, (rect.height - 100) / layout.height, 0.45), 0.04);
    const next = { x: (rect.width - WORLD_WIDTH * scale) / 2, y: 70, scale };
    setSelected(firstDecision);
    viewRef.current = next;
    setView(next);
  }

  function zoomAt(clientX: number, clientY: number, nextScale: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const current = viewRef.current;
    const rect = viewport.getBoundingClientRect();
    const scale = Math.min(Math.max(nextScale, 0.04), 1.6);
    const pointX = (clientX - rect.left - current.x) / current.scale;
    const pointY = (clientY - rect.top - current.y) / current.scale;
    const next = { x: clientX - rect.left - pointX * scale, y: clientY - rect.top - pointY * scale, scale };
    viewRef.current = next;
    setView(next);
  }

  function zoomFromCentre(multiplier: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, viewRef.current.scale * multiplier);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const current = viewRef.current;
    dragRef.current = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, x: current.x, y: current.y };
    setDragging(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const next = { ...viewRef.current, x: drag.x + event.clientX - drag.clientX, y: drag.y + event.clientY - drag.clientY };
    viewRef.current = next;
    setView(next);
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => focusDecision(firstDecision, 0.82));
    return () => window.cancelAnimationFrame(frame);
    // Initial camera placement is deliberately applied only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const current = viewRef.current;
      if (event.ctrlKey || event.metaKey) {
        const rect = viewport.getBoundingClientRect();
        const scale = Math.min(Math.max(current.scale * Math.exp(-event.deltaY * 0.008), 0.04), 1.6);
        const pointX = (event.clientX - rect.left - current.x) / current.scale;
        const pointY = (event.clientY - rect.top - current.y) / current.scale;
        const next = { x: event.clientX - rect.left - pointX * scale, y: event.clientY - rect.top - pointY * scale, scale };
        viewRef.current = next;
        setView(next);
        return;
      }
      const next = { ...current, x: current.x - event.deltaX, y: current.y - event.deltaY };
      viewRef.current = next;
      setView(next);
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, []);

  const worldStyle = { width: WORLD_WIDTH, height: layout.height, left: view.x, top: view.y, transform: `scale(${view.scale})` } satisfies CSSProperties;

  return (
    <section className={styles.workspace} aria-label={ariaLabel}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarTitle}><strong>2KO</strong><span>INTERNAL · {toolbarTitle}</span></div>
        <div className={styles.stageNav} aria-label="Jump to stage">
          {layout.stages.map((stage) => <button key={stage.number} type="button" onClick={() => focusDecision(stage.firstDecision, 0.68)}>{stage.number}</button>)}
        </div>
        <div className={styles.controls}>
          <Link className={styles.libraryLink} href="/internal/processes">LIBRARY</Link>
          <button type="button" onClick={() => zoomFromCentre(0.82)} aria-label="Zoom out">−</button>
          <output>{Math.round(view.scale * 100)}%</output>
          <button type="button" onClick={() => zoomFromCentre(1.22)} aria-label="Zoom in">+</button>
          <button type="button" onClick={() => focusDecision(firstDecision, 0.82)}>START</button>
          <button type="button" onClick={fitOverview}>OVERVIEW</button>
        </div>
      </header>

      <div ref={viewportRef} className={styles.viewport} data-dragging={dragging} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
        <div className={styles.instructions}>DRAG TO MOVE · SCROLL TO PAN · PINCH OR CTRL + SCROLL TO ZOOM</div>
        <div className={styles.world} style={worldStyle}>
          <div className={styles.canvasTitle}>
            <span>2KO INTERNAL OPERATING MAP</span><h1>{title}</h1><p>{introduction}</p>
          </div>

          {layout.stages.map((stage) => (
            <section key={stage.number} className={styles.stageMarker} style={{ left: stage.x, top: stage.y, width: stage.width, height: stage.height }}>
              <span>STAGE {stage.number}</span><h2>{stage.title}</h2><p>{stage.purpose}</p>
            </section>
          ))}

          <svg className={styles.lines} width={WORLD_WIDTH} height={layout.height} aria-hidden="true">
            <defs>
              <marker id="process-arrow-yes" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path className={styles.yesArrowhead} d="M0,0 L9,4.5 L0,9" /></marker>
              <marker id="process-arrow-no" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path className={styles.noArrowhead} d="M0,0 L9,4.5 L0,9" /></marker>
            </defs>
            {layout.decisions.flatMap((item) => {
              const branchY = item.y + 350;
              const yesX = item.centre - 360;
              const noX = item.centre + 360;
              return [
                <path key={`${item.id}-yes`} className={styles.forkLine} data-answer="yes" d={`M${item.centre} ${item.y + DECISION_HEIGHT} C${item.centre} ${item.y + 305},${yesX} ${item.y + 292},${yesX} ${branchY}`} markerEnd="url(#process-arrow-yes)" />,
                <path key={`${item.id}-no`} className={styles.forkLine} data-answer="no" d={`M${item.centre} ${item.y + DECISION_HEIGHT} C${item.centre} ${item.y + 305},${noX} ${item.y + 292},${noX} ${branchY}`} markerEnd="url(#process-arrow-no)" />,
                ...([item.yesNext, item.noNext] as const).map((next, branchIndex) => {
                  const targetId = getTarget(next);
                  const target = targetId ? layout.byId.get(targetId) : undefined;
                  if (!target || target.parentSource !== item.id) return null;
                  const sourceX = branchIndex === 0 ? yesX : noX;
                  const sourceY = branchY + BRANCH_HEIGHT;
                  const related = selected === item.id || selected === targetId;
                  const path = `M${sourceX} ${sourceY} C${sourceX} ${sourceY + 75},${target.centre} ${target.y - 75},${target.centre} ${target.y}`;
                  const answer = branchIndex === 0 ? "yes" : "no";
                  return <path key={`${item.id}-route-${branchIndex}`} className={styles.routeLine} data-answer={answer} data-active={related} d={path} markerEnd={`url(#process-arrow-${answer})`} />;
                }),
              ];
            })}
          </svg>

          {layout.decisions.map((item) => <DecisionGroup key={item.id} item={item} selected={selected === item.id} onSelect={setSelected} onNavigate={focusDecision} />)}

          <aside className={styles.finalRule} style={{ left: (WORLD_WIDTH - 1340) / 2, top: layout.height - 420 }}>
            <span>FINAL CONTROL</span><h2>{finalTitle}</h2><p>{finalCopy}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function DecisionGroup({ item, selected, onSelect, onNavigate }: { item: PositionedDecision; selected: boolean; onSelect: (id: CanvasDecision["id"]) => void; onNavigate: (id: CanvasDecision["id"], scale?: number) => void }) {
  const branchY = item.y + 350;
  return (
    <>
      <article className={styles.decision} data-selected={selected} style={{ left: item.x, top: item.y, width: DECISION_WIDTH, height: DECISION_HEIGHT }} onClick={() => onSelect(item.id)}>
        <div className={styles.cardMeta}><span>{item.id}</span><span>OWNER · {item.owner}</span></div>
        <h3>{item.question}</h3><p>{item.why}</p><footer><span>RECORD</span>{item.record}</footer>
      </article>
      <span className={styles.answerBadge} data-answer="yes" aria-hidden="true" style={{ left: item.centre - 250, top: item.y + 286 }}>YES</span>
      <span className={styles.answerBadge} data-answer="no" aria-hidden="true" style={{ left: item.centre + 170, top: item.y + 286 }}>NO</span>
      <BranchNode label="YES" action={item.yes} next={item.yesNext} x={item.centre - 360 - BRANCH_WIDTH / 2} y={branchY} onNavigate={onNavigate} />
      <BranchNode label="NO" action={item.no} next={item.noNext} x={item.centre + 360 - BRANCH_WIDTH / 2} y={branchY} onNavigate={onNavigate} />
    </>
  );
}

function BranchNode({ label, action, next, x, y, onNavigate }: { label: "YES" | "NO"; action: string; next: string; x: number; y: number; onNavigate: (id: CanvasDecision["id"], scale?: number) => void }) {
  const target = getTarget(next);
  return (
    <article className={styles.branch} data-answer={label.toLowerCase()} style={{ left: x, top: y, width: BRANCH_WIDTH, height: BRANCH_HEIGHT }}>
      <span>{label} ACTION</span><p>{action}</p>
      {target ? <button type="button" onClick={() => onNavigate(target)}>THEN → {next}</button> : <strong>THEN → {next}</strong>}
    </article>
  );
}
