import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { usePlannerStore, getVisibleCards } from '../store/usePlannerStore';
import { Card } from './Card';
import { Settings, Trash2, Sparkles } from 'lucide-react';
import { recognizeShape } from '../utils/shapeRecognizer';

/**
 * @file Canvas.jsx
 * @description Core Component: Infinite Spatial Node-Graph.
 * Implements a hardware-accelerated 2D canvas allowing users to drag, resize, 
 * and connect polymorphic nodes. Features custom zooming, panning, and GSAP-based physics.
 * 
 * @component
 */

gsap.registerPlugin(Draggable);

const BUFFER = 500;

const EmptyState = () => (
  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-text-muted/60 select-none z-0">
    <Sparkles className="w-12 h-12 mb-4 opacity-50" />
    <h2 className="font-display font-bold text-2xl tracking-tight mb-2">The canvas is yours.</h2>
    <p className="font-body text-sm flex items-center gap-1">
      Double-click anywhere to spawn a thought, or press{' '}
      <kbd className="font-mono bg-surface/50 px-2 py-1 rounded text-xs">Cmd+K</kbd>
    </p>
  </div>
);

export const Canvas = () => {
  const {
    cards,
    connections,
    viewport,
    updateViewport,
    updateCardPosition,
    updateCardSize,
    addCard,
    activeTool,
    setActiveTool,
    addConnection,
    selectedCardIds,
    toggleCardSelection,
    clearSelection,
    importWorkspace,
    drawings,
    activeDrawingTool,
    drawingColor,
    drawingWidth,
    addDrawing,
    updateDrawing,
    deleteDrawings,
  } = usePlannerStore();

  const wrapperRef = useRef(null);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const gridRef = useRef(null);
  const pathRefs = useRef({});
  const cardRefs = useRef({});
  const resizeObserverRef = useRef(null);
  const isConnectingRef = useRef(false);
  const [activeConnectionMenu, setActiveConnectionMenu] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [lassoRect, setLassoRect] = useState(null);
  const isLassoing = useRef(false);
  const lassoStart = useRef({ x: 0, y: 0 });
  const isDraggingCardRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentDrawingIdRef = useRef(null);
  
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const viewportPosRef = useRef({ x: viewport.x, y: viewport.y });

  useEffect(() => {
    viewportPosRef.current = { x: viewport.x, y: viewport.y };
    if (wrapperRef.current && !isPanningRef.current) {
      wrapperRef.current.style.transform = `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`;
    }
  }, [viewport.x, viewport.y, viewport.scale]);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const activeCards = getVisibleCards(cards, connections);
  const activeConnections = connections.filter(
    (conn) =>
      activeCards.some((c) => c.id === conn.source) && activeCards.some((c) => c.id === conn.target)
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Viewport Draggable removed in favor of native pointer events
  // Zoom logic
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey || activeTool === 'pan') {
        e.preventDefault();
        const zoomSensitivity = 0.001;
        let newScale = viewport.scale - e.deltaY * zoomSensitivity;

        newScale = Math.max(0.2, Math.min(newScale, 2.0));

        const localX = (e.clientX - viewport.x) / viewport.scale;
        const localY = (e.clientY - viewport.y) / viewport.scale;

        gsap.to(wrapperRef.current, {
          scale: newScale,
          x: e.clientX - localX * newScale,
          y: e.clientY - localY * newScale,
          duration: 0.15,
          onUpdate: () => {
            const currentScale = gsap.getProperty(wrapperRef.current, 'scale');
            const currentX = gsap.getProperty(wrapperRef.current, 'x');
            const currentY = gsap.getProperty(wrapperRef.current, 'y');
            updateViewport({ x: currentX, y: currentY, scale: currentScale });
          },
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [viewport, activeTool, updateViewport]);

  const getPortCoords = (node, stateCard, port) => {
    const w = node && node.offsetWidth > 0 ? node.offsetWidth : stateCard.width || 250;
    const h = node && node.offsetHeight > 0 ? node.offsetHeight : stateCard.height || 200;

    let x = stateCard.x;
    let y = stateCard.y;

    // Only use live GSAP coordinates during an active drag to prevent
    // uninitialized transforms from breaking wires on file load.
    if (isDraggingCardRef.current && node) {
      const gx = gsap.getProperty(node, 'x');
      const gy = gsap.getProperty(node, 'y');
      if (typeof gx === 'number') x = gx;
      if (typeof gy === 'number') y = gy;
    }

    switch (port) {
      case 'top':
        return { x: x + w / 2, y };
      case 'right':
        return { x: x + w, y: y + h / 2 };
      case 'bottom':
        return { x: x + w / 2, y: y + h };
      case 'left':
        return { x, y: y + h / 2 };
      case 'center':
        return { x: x + w / 2, y: y + h / 2 };
      default:
        return { x: x + w / 2, y: y + h / 2 };
    }
  };

  const calculateBezier = (p1, p2, port1, port2) => {
    const offset = 100;
    const getControlPoint = (p, port) => {
      let cp = { ...p };
      switch (port) {
        case 'top':
          cp.y -= offset;
          break;
        case 'right':
          cp.x += offset;
          break;
        case 'bottom':
          cp.y += offset;
          break;
        case 'left':
          cp.x -= offset;
          break;
        case 'center':
          break;
      }
      return cp;
    };
    const cp1 = getControlPoint(p1, port1);
    const cp2 = getControlPoint(p2, port2);
    return `M ${p1.x},${p1.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${p2.x},${p2.y}`;
  };

  const updatePaths = useCallback(() => {
    activeConnections.forEach((conn) => {
      const sourceCard = activeCards.find((c) => c.id === conn.source);
      const targetCard = activeCards.find((c) => c.id === conn.target);
      if (sourceCard && targetCard) {
        const sNode = document.getElementById(conn.source);
        const tNode = document.getElementById(conn.target);
        const p1 = getPortCoords(sNode, sourceCard, conn.sourcePort);
        const p2 = getPortCoords(tNode, targetCard, conn.targetPort);
        const newD = calculateBezier(p1, p2, conn.sourcePort, conn.targetPort);
        const paths = pathRefs.current[conn.id];
        if (paths && Array.isArray(paths)) {
          paths.forEach((p) => {
            if (p) p.setAttribute('d', newD);
          });
        }
      }
    });
  }, [activeCards, activeConnections]);

  useLayoutEffect(() => {
    updatePaths();
  }, [updatePaths]);

  // Global Redraw Trigger: Sync wires if positional data changes outside of native drag
  useEffect(() => {
    activeCards.forEach((card) => {
      const node = document.getElementById(card.id);
      if (node && node.dataset.dragX === undefined) {
        node.style.transform = `translate(${card.x}px, ${card.y}px)`;
      }
    });
  }, [activeCards]);

  useEffect(() => {
    window.addEventListener('updatePaths', updatePaths);
    return () => window.removeEventListener('updatePaths', updatePaths);
  }, [updatePaths]);

  useEffect(() => {
    resizeObserverRef.current = new ResizeObserver((entries) => {
      let needsPathUpdate = false;
      for (let entry of entries) {
        const node = entry.target;
        const id = node.id;
        const card = activeCards.find((c) => c.id === id);
        if (card && (node.offsetWidth !== card.width || node.offsetHeight !== card.height)) {
          updateCardSize(id, node.offsetWidth, node.offsetHeight);
          needsPathUpdate = true;
        }
      }
      if (needsPathUpdate) updatePaths();
    });
    return () => {
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
    };
  }, [activeCards, updateCardSize, updatePaths]);

  const visibleCards = activeCards.filter((card) => {
    const left = -viewport.x / viewport.scale - BUFFER;
    const top = -viewport.y / viewport.scale - BUFFER;
    const right = (windowSize.width - viewport.x) / viewport.scale + BUFFER;
    const bottom = (windowSize.height - viewport.y) / viewport.scale + BUFFER;
    const w = card.width || 250;
    const h = card.height || 250;
    return card.x + w > left && card.x < right && card.y + h > top && card.y < bottom;
  });

  const [connecting, setConnecting] = useState(null);
  const connectingPathRef = useRef(null);
  const currentConnectingRef = useRef(null);

  const handlePointerDown = (e) => {
    const target = e.target?.nodeType === 3 ? e.target.parentNode : e.target;
    const port = target?.closest?.('.port');
    const store = usePlannerStore.getState();

    if (port && (activeTool === 'connect' || activeTool === 'cursor')) {
      e.stopPropagation();
      
      const activeStart = store.activeConnectionStart;
      const clickedCardId = port.dataset.cardId;
      const clickedPort = port.dataset.port;

      if (activeStart) {
        if (activeStart.cardId !== clickedCardId) {
          addConnection(
            activeStart.cardId,
            clickedCardId,
            activeStart.port,
            clickedPort,
            'related',
            ''
          );
        }
        store.setActiveConnectionStart(null);
        return;
      }

      currentConnectingRef.current = {
        sourceId: clickedCardId,
        sourcePort: clickedPort,
        isDrag: false
      };
      isConnectingRef.current = true;
      
      store.setActiveConnectionStart({ cardId: clickedCardId, port: clickedPort });

      const rect = wrapperRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / viewport.scale;
      const y = (e.clientY - rect.top) / viewport.scale;

      if (connectingPathRef.current) {
        connectingPathRef.current.style.display = 'block';
        const sourceCard = activeCards.find((c) => c.id === currentConnectingRef.current.sourceId);
        const p1 = getPortCoords(
          cardRefs.current[currentConnectingRef.current.sourceId],
          sourceCard,
          currentConnectingRef.current.sourcePort
        );
        connectingPathRef.current.setAttribute(
          'd',
          calculateBezier(p1, { x, y }, currentConnectingRef.current.sourcePort, 'center')
        );
      }
      return;
    }

    store.setActiveConnectionStart(null);

    if (target?.closest?.('.card-node') || target?.closest?.('.connection-menu')) return;
    if (activeConnectionMenu) setActiveConnectionMenu(null);
    if (['note', 'task', 'image', 'code', 'bookmark', 'audio', 'pdf', 'ai'].includes(activeTool)) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / viewport.scale;
      const y = (e.clientY - rect.top) / viewport.scale;
      addCard(activeTool, x, y);
      setActiveTool('cursor');
      return;
    } else if (activeTool === 'draw') {
      const rect = wrapperRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / viewport.scale;
      const y = (e.clientY - rect.top) / viewport.scale;

      setIsDrawing(true);
      if (activeDrawingTool !== 'eraser') {
        currentDrawingIdRef.current = `draw-${Date.now()}`;
        addDrawing({
          id: currentDrawingIdRef.current,
          type: activeDrawingTool,
          points: [{ x, y }],
          color: drawingColor,
          width: drawingWidth,
        });
      }
      return;
    } else if (activeTool === 'cursor' || activeTool === 'pan') {
      const isCardHit = target?.closest?.('.card-node') || target?.closest?.('.port') || target?.closest?.('[data-resize-handle]');
      
      if (activeTool === 'pan' || (activeTool === 'cursor' && !isCardHit && e.button !== 2)) {
        if (activeTool === 'cursor' && e.shiftKey) {
          const rect = wrapperRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left) / viewport.scale;
          const y = (e.clientY - rect.top) / viewport.scale;
          isLassoing.current = true;
          lassoStart.current = { x, y };
          setLassoRect({ startX: x, startY: y, endX: x, endY: y });
        } else {
          if (!e.shiftKey) clearSelection();
          isPanningRef.current = true;
          panStartRef.current = { x: e.clientX, y: e.clientY };
        }
      } else if (activeTool === 'cursor' && !e.shiftKey) {
        clearSelection();
      }
    }
  };

  const handlePointerMove = (e) => {
    if (currentConnectingRef.current) {
      currentConnectingRef.current.isDrag = true;
      const rect = wrapperRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / viewport.scale;
      const mouseY = (e.clientY - rect.top) / viewport.scale;

      if (connectingPathRef.current) {
        const sourceCard = activeCards.find((c) => c.id === currentConnectingRef.current.sourceId);
        const p1 = getPortCoords(
          cardRefs.current[currentConnectingRef.current.sourceId],
          sourceCard,
          currentConnectingRef.current.sourcePort
        );
        connectingPathRef.current.setAttribute(
          'd',
          calculateBezier(
            p1,
            { x: mouseX, y: mouseY },
            currentConnectingRef.current.sourcePort,
            'center'
          )
        );
      }
    } else if (isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      
      const newX = viewportPosRef.current.x + dx;
      const newY = viewportPosRef.current.y + dy;
      
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0) scale(${viewport.scale})`;
      }
      if (gridRef.current) {
        gridRef.current.style.backgroundPosition = `${newX}px ${newY}px`;
      }
    } else if (isLassoing.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / viewport.scale;
      const y = (e.clientY - rect.top) / viewport.scale;
      setLassoRect((prev) => (prev ? { ...prev, endX: x, endY: y } : null));
    } else if (activeTool === 'draw' && isDrawing) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / viewport.scale;
      const y = (e.clientY - rect.top) / viewport.scale;

      if (activeDrawingTool === 'eraser') {
        const eraserRadius = 15;
        const intersectingIds = drawings
          .filter((d) => {
            return d.points.some((p) => Math.hypot(p.x - x, p.y - y) < eraserRadius);
          })
          .map((d) => d.id);

        if (intersectingIds.length > 0) {
          deleteDrawings(intersectingIds);
        }
      } else if (currentDrawingIdRef.current) {
        const drawing = drawings.find((d) => d.id === currentDrawingIdRef.current);
        if (drawing) {
          updateDrawing(currentDrawingIdRef.current, { points: [...drawing.points, { x, y }] });
        }
      }
    }
  };

  const handlePointerUp = (e) => {
    const target = e.target?.nodeType === 3 ? e.target.parentNode : e.target;
    const port = target?.closest?.('.port');
    
    if (currentConnectingRef.current) {
      e.stopPropagation();
      isConnectingRef.current = false;
      
      if (currentConnectingRef.current.isDrag) {
        if (port && currentConnectingRef.current.sourceId !== port.dataset.cardId) {
          addConnection(
            currentConnectingRef.current.sourceId,
            port.dataset.cardId,
            currentConnectingRef.current.sourcePort,
            port.dataset.port,
            'related',
            ''
          );
        }
        usePlannerStore.getState().setActiveConnectionStart(null);
        setConnecting(null);
        currentConnectingRef.current = null;
        if (connectingPathRef.current) connectingPathRef.current.style.display = 'none';
      } else {
        if (connectingPathRef.current) connectingPathRef.current.style.display = 'none';
        currentConnectingRef.current = null;
      }
      return;
    }

    if (isPanningRef.current) {
      isPanningRef.current = false;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      const newX = viewportPosRef.current.x + dx;
      const newY = viewportPosRef.current.y + dy;
      
      viewportPosRef.current = { x: newX, y: newY };
      updateViewport({ x: newX, y: newY, scale: viewport.scale });
      return;
    }

    if (activeTool === 'draw' && isDrawing) {
      if (currentDrawingIdRef.current) {
        const store = usePlannerStore.getState();
        const drawing = store.drawings.find((d) => d.id === currentDrawingIdRef.current);
        if (drawing && drawing.points.length >= 5 && store.smartShapesEnabled) {
          const shapeData = recognizeShape(drawing.points);
          if (shapeData) {
            store.updateDrawing(currentDrawingIdRef.current, { shapeData });
          }
        }
      }
      setIsDrawing(false);
      currentDrawingIdRef.current = null;
      setDraggablesEnabled(true);
      return;
    }

    if (activeTool === 'cursor' && isLassoing.current && lassoRect) {
      const minX = Math.min(lassoRect.startX, lassoRect.endX);
      const maxX = Math.max(lassoRect.startX, lassoRect.endX);
      const minY = Math.min(lassoRect.startY, lassoRect.endY);
      const maxY = Math.max(lassoRect.startY, lassoRect.endY);

      const store = usePlannerStore.getState();
      activeCards.forEach((card) => {
        const cardW = card.width || 250;
        const cardH = card.height || 200;
        if (card.x < maxX && card.x + cardW > minX && card.y < maxY && card.y + cardH > minY) {
          if (!store.selectedCardIds.includes(card.id)) {
            store.toggleCardSelection(card.id, true);
          }
        }
      });

      isLassoing.current = false;
      setLassoRect(null);
      setDraggablesEnabled(true);
    }
  };

  const getConnectionStyle = (type) => {
    switch (type) {
      case 'blocks':
        return {
          color: '#991B1B',
          pulseWidth: '4',
          glow: 'drop-shadow(0 0 12px rgba(153,27,27,0.8))',
        };
      case 'depends_on':
        return {
          color: '#B45309',
          pulseWidth: '3',
          glow: 'drop-shadow(0 0 12px rgba(180,83,9,0.8))',
        };
      case 'references':
        return {
          color: '#0369A1',
          pulseWidth: '3',
          glow: 'drop-shadow(0 0 12px rgba(3,105,161,0.8))',
        };
      case 'owned_by':
        return {
          color: '#047857',
          pulseWidth: '5',
          glow: 'drop-shadow(0 0 12px rgba(4,120,87,0.8))',
        };
      default:
        return {
          color: '#C2410C',
          pulseWidth: '3',
          glow: 'drop-shadow(0 0 12px rgba(194,65,12,0.8))',
        };
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (
        file.name.endsWith('.zaforge') ||
        file.name.endsWith('.spatial') ||
        file.name.endsWith('.json')
      ) {
        const reader = new FileReader();
        reader.onload = (event) => {
          usePlannerStore.getState().importWorkspace(event.target.result);
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full absolute inset-0 overflow-hidden bg-canvas ${activeTool === 'pan' ? 'cursor-grab' : activeTool === 'connect' ? 'cursor-crosshair' : 'cursor-default'}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDraggingFile && (
        <div className="absolute inset-0 z-[1000] bg-orange-500/10 backdrop-blur-sm border-4 border-dashed border-orange-500 m-4 rounded-3xl flex items-center justify-center pointer-events-none transition-all duration-300">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 transform scale-110">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl">
              📂
            </div>
            <h2 className="text-xl font-bold text-gray-800">Drop workspace file here to load</h2>
            <p className="text-sm text-gray-500">Supports .zaforge files</p>
          </div>
        </div>
      )}

      {/* Fog of War Vignette */}
      <div 
        className="pointer-events-none fixed inset-0 z-50"
        style={{ background: 'radial-gradient(circle, transparent 60%, rgba(10,10,11,1) 100%)' }}
      ></div>

      <div
        ref={gridRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-dots) 1px, transparent 0)',
          backgroundSize: `${40 * viewport.scale}px ${40 * viewport.scale}px`,
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        }}
      ></div>

      <div
        ref={wrapperRef}
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate3d(${viewportPosRef.current.x}px, ${viewportPosRef.current.y}px, 0) scale(${viewport.scale})`,
          willChange: 'transform',
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-[5]">
          {drawings.map((d) => {
            if (!d.points || d.points.length === 0) return null;

            const isNeon = d.type === 'neon' || d.isNeon;
            const opacity = d.type === 'highlighter' ? 0.4 : 1;
            const neonStyle = isNeon
              ? { filter: 'drop-shadow(0 0 2px currentColor) drop-shadow(0 0 6px currentColor)' }
              : {};
            const coreProps = isNeon
              ? { stroke: 'white', strokeWidth: Math.max(1, d.width / 2.5), style: {} }
              : null;

            const renderShape = (overrideProps = {}, keySuffix = '') => {
              if (d.shapeData) {
                const s = d.shapeData;
                if (s.type === 'circle') {
                  return (
                    <circle
                      key={`${d.id}${keySuffix}`}
                      cx={s.cx}
                      cy={s.cy}
                      r={s.r}
                      fill="none"
                      stroke={d.color}
                      strokeWidth={d.width}
                      opacity={opacity}
                      style={neonStyle}
                      {...overrideProps}
                    />
                  );
                } else if (s.type === 'rectangle') {
                  return (
                    <rect
                      key={`${d.id}${keySuffix}`}
                      x={s.x}
                      y={s.y}
                      width={s.w}
                      height={s.h}
                      fill="none"
                      stroke={d.color}
                      strokeWidth={d.width}
                      rx="8"
                      opacity={opacity}
                      style={neonStyle}
                      {...overrideProps}
                    />
                  );
                } else if (s.type === 'line') {
                  return (
                    <line
                      key={`${d.id}${keySuffix}`}
                      x1={s.x1}
                      y1={s.y1}
                      x2={s.x2}
                      y2={s.y2}
                      stroke={d.color}
                      strokeWidth={d.width}
                      strokeLinecap="round"
                      opacity={opacity}
                      style={neonStyle}
                      {...overrideProps}
                    />
                  );
                } else if (s.type === 'ellipse') {
                  return (
                    <ellipse
                      key={`${d.id}${keySuffix}`}
                      cx={s.cx}
                      cy={s.cy}
                      rx={s.rx}
                      ry={s.ry}
                      fill="none"
                      stroke={d.color}
                      strokeWidth={d.width}
                      opacity={opacity}
                      style={neonStyle}
                      {...overrideProps}
                    />
                  );
                } else if (s.type === 'polygon') {
                  const pts = s.points.map((p) => `${p.x},${p.y}`).join(' ');
                  return (
                    <polygon
                      key={`${d.id}${keySuffix}`}
                      points={pts}
                      fill="none"
                      stroke={d.color}
                      strokeWidth={d.width}
                      strokeLinejoin="round"
                      opacity={opacity}
                      style={neonStyle}
                      {...overrideProps}
                    />
                  );
                }
              }

              let pathData = `M ${d.points[0].x},${d.points[0].y}`;
              for (let i = 1; i < d.points.length - 1; i++) {
                const xc = (d.points[i].x + d.points[i + 1].x) / 2;
                const yc = (d.points[i].y + d.points[i + 1].y) / 2;
                pathData += ` Q ${d.points[i].x},${d.points[i].y} ${xc},${yc}`;
              }
              if (d.points.length > 1) {
                pathData += ` L ${d.points[d.points.length - 1].x},${d.points[d.points.length - 1].y}`;
              }

              return (
                <path
                  key={`${d.id}${keySuffix}`}
                  d={pathData}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={d.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={opacity}
                  style={neonStyle}
                  {...overrideProps}
                />
              );
            };

            if (isNeon) {
              return (
                <g key={d.id} style={{ color: d.color }}>
                  {renderShape({})}
                  {renderShape(coreProps, '-core')}
                </g>
              );
            }

            return renderShape({});
          })}
        </svg>

        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10"
        >
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#F97316" />
            </marker>
          </defs>
          {activeConnections.map((conn) => {
            const style = getConnectionStyle(conn.type);
            const pathData =
              pathRefs.current[conn.id] && pathRefs.current[conn.id][0]
                ? pathRefs.current[conn.id][0].getAttribute('d')
                : '';
            const isActive = activeConnectionMenu?.id === conn.id;

            return (
              <g
                key={conn.id}
                className="pointer-events-auto cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveConnectionMenu({ id: conn.id, x: e.clientX, y: e.clientY });
                }}
              >
                {/* 1. Invisible Ultra-thick hit box for easy clicking */}
                <path
                  ref={(el) => {
                    if (!pathRefs.current[conn.id]) pathRefs.current[conn.id] = [];
                    pathRefs.current[conn.id][0] = el;
                  }}
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="30"
                />

                {/* 2. Base wire (subtle background line) */}
                <path
                  ref={(el) => {
                    if (!pathRefs.current[conn.id]) pathRefs.current[conn.id] = [];
                    pathRefs.current[conn.id][1] = el;
                  }}
                  d={pathData}
                  fill="none"
                  stroke={style.color}
                  strokeWidth={style.pulseWidth}
                  opacity={isActive ? '0.4' : '0.1'}
                  className="transition-opacity group-hover:opacity-30"
                />

                {/* 3. Animated Energy Pulse overlay */}
                <path
                  ref={(el) => {
                    if (!pathRefs.current[conn.id]) pathRefs.current[conn.id] = [];
                    pathRefs.current[conn.id][2] = el;
                  }}
                  d={pathData}
                  fill="none"
                  stroke={style.color}
                  strokeWidth={style.pulseWidth}
                  strokeDasharray="8 8"
                  style={{ filter: isActive ? style.glow : 'none', animation: 'dash-flow 1s linear infinite' }}
                  className={`transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100 group-hover:drop-shadow-[0_0_5px_currentColor]'}`}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
          <path
            ref={connectingPathRef}
            fill="none"
            stroke="#F97316"
            strokeWidth="2"
            strokeDasharray="5 5"
            className="animate-dash-flow opacity-80"
            markerEnd="url(#arrow-default)"
            style={{ display: 'none' }}
          />
        </svg>

        {cards.length === 0 && drawings.length === 0 && <EmptyState />}

        {visibleCards.map((card) => (
          <Card key={card.id} card={card} />
        ))}

        {/* Lasso Marquee */}
        {lassoRect && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: Math.min(lassoRect.startX, lassoRect.endX),
              top: Math.min(lassoRect.startY, lassoRect.endY),
              width: Math.abs(lassoRect.endX - lassoRect.startX),
              height: Math.abs(lassoRect.endY - lassoRect.startY),
              border: '1px dashed var(--primary, #f97316)',
              backgroundColor: 'rgba(249, 115, 22, 0.05)',
              zIndex: 1000,
            }}
          />
        )}
      </div>

      {/* Multi-Selection Context Menu */}
      {selectedCardIds.length > 1 && (
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-white shadow-xl rounded-full px-4 py-2 flex items-center gap-4 border border-gray-100 pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="text-sm font-semibold text-gray-500">
            {selectedCardIds.length} selected
          </span>
          <div className="w-px h-4 bg-gray-200"></div>

          <button
            onClick={() => usePlannerStore.getState().deleteSelectedCards()}
            className="text-red-500 hover:text-red-600 transition-colors p-1 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeConnectionMenu &&
        (() => {
          const conn = activeConnections.find((c) => c.id === activeConnectionMenu.id);
          const currType = conn ? conn.type : null;

          const renderMenuBtn = (type, label, colorHex) => {
            const isActive = currType === type;
            return (
              <button
                onClick={() => {
                  usePlannerStore.getState().updateConnection(activeConnectionMenu.id, { type });
                  setActiveConnectionMenu(null);
                }}
                className={`flex items-center px-3 py-2 text-xs font-semibold tracking-wide rounded-lg transition-all ${isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full mr-3 shadow-sm ${isActive ? 'shadow-[0_0_8px_currentColor]' : ''}`}
                  style={{ backgroundColor: colorHex, color: colorHex }}
                ></span>
                {label}
              </button>
            );
          };

          return (
            <div
              className="connection-menu absolute z-50 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-2 flex flex-col gap-0.5 w-48 pointer-events-auto"
              style={{ left: activeConnectionMenu.x, top: activeConnectionMenu.y }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 mb-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                Connection Type
              </div>
              {renderMenuBtn('blocks', 'Blocks', '#EF4444')}
              {renderMenuBtn('depends_on', 'Depends On', '#EAB308')}
              {renderMenuBtn('references', 'References', '#06B6D4')}
              {renderMenuBtn('owned_by', 'Owned By', '#10B981')}
              <div className="h-px bg-white/5 my-1"></div>
              <button
                onClick={() => {
                  usePlannerStore.getState().deleteConnection(activeConnectionMenu.id);
                  setActiveConnectionMenu(null);
                }}
                className="flex items-center px-3 py-2 text-xs font-semibold tracking-wide rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all mt-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Wire
              </button>
            </div>
          );
        })()}
    </div>
  );
};
