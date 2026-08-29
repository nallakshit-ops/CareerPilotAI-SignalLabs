"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

const palette = [
  "56, 189, 248",
  "45, 212, 191",
  "99, 102, 241",
  "236, 72, 153",
  "244, 114, 182",
  "59, 130, 246",
];

const randomColor = () => palette[Math.floor(Math.random() * palette.length)];

export const BoxesCore = ({ className, ...rest }) => {
  const boardRef = useRef(null);
  const activeIndexRef = useRef(-1);
  const rafRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0, withRipple: false, color: null });
  const activeColorRef = useRef("56, 189, 248");
  const rippleId = useRef(0);
  const [layout, setLayout] = useState({ rows: 20, cols: 36 });
  const [activeCell, setActiveCell] = useState(null);
  const [activeColor, setActiveColor] = useState("56, 189, 248");
  const [ripples, setRipples] = useState([]);

  const rotateX = useSpring(0, { stiffness: 120, damping: 22, mass: 0.6 });
  const rotateY = useSpring(0, { stiffness: 120, damping: 22, mass: 0.6 });
  const cursorX = useMotionValue(-1000);
  const cursorY = useMotionValue(-1000);
  const glowOpacity = useSpring(0, { stiffness: 160, damping: 26, mass: 0.8 });

  useEffect(() => {
    activeColorRef.current = activeColor;
  }, [activeColor]);

  useEffect(() => {
    if (!boardRef.current) {
      return undefined;
    }

    const element = boardRef.current;

    const updateGrid = () => {
      const rect = element.getBoundingClientRect();
      const cols = Math.max(18, Math.ceil(rect.width / 58) + 2);
      const rows = Math.max(12, Math.ceil(rect.height / 42) + 2);
      setLayout({ rows, cols });
    };

    updateGrid();

    const observer = new ResizeObserver(updateGrid);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const cells = useMemo(() => {
    return Array.from({ length: layout.rows * layout.cols }, (_, index) => ({
      index,
      row: Math.floor(index / layout.cols),
      col: index % layout.cols,
    }));
  }, [layout]);

  const setInteractiveState = (
    clientX,
    clientY,
    withRipple = false,
    colorOverride = null,
  ) => {
    if (!boardRef.current) {
      return;
    }

    const rect = boardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      glowOpacity.set(0);
      return;
    }

    cursorX.set(x);
    cursorY.set(y);
    glowOpacity.set(1);

    const col = Math.min(
      layout.cols - 1,
      Math.max(0, Math.floor((x / rect.width) * layout.cols)),
    );
    const row = Math.min(
      layout.rows - 1,
      Math.max(0, Math.floor((y / rect.height) * layout.rows)),
    );
    const index = row * layout.cols + col;

    if (index !== activeIndexRef.current) {
      activeIndexRef.current = index;
      if (colorOverride) {
        setActiveColor(colorOverride);
      } else if (Math.random() > 0.82) {
        setActiveColor(randomColor());
      }
      setActiveCell({ row, col, index });
    }

    if (withRipple) {
      addRipple({ clientX, clientY }, colorOverride || activeColorRef.current);
    }

    const nx = x / rect.width - 0.5;
    const ny = y / rect.height - 0.5;
    rotateX.set(-ny * 9);
    rotateY.set(nx * 9);
  };

  const onPointerMove = (event) => {
    pointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      withRipple: false,
      color: null,
    };

    if (rafRef.current) {
      return;
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const pointer = pointerRef.current;
      setInteractiveState(
        pointer.x,
        pointer.y,
        pointer.withRipple,
        pointer.color,
      );
    });
  };

  const onPointerDown = (event) => {
    const nextColor = randomColor();
    setActiveColor(nextColor);
    activeColorRef.current = nextColor;
    setInteractiveState(event.clientX, event.clientY, true, nextColor);
  };

  const onLeave = () => {
    glowOpacity.set(0);
    setActiveCell(null);
    activeIndexRef.current = -1;
    rotateX.set(0);
    rotateY.set(0);
  };

  useEffect(() => {
    const onWindowMove = (event) => {
      onPointerMove(event);
    };

    const onWindowDown = (event) => {
      onPointerDown(event);
    };

    window.addEventListener("pointermove", onWindowMove, { passive: true });
    window.addEventListener("pointerdown", onWindowDown, { passive: true });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerdown", onWindowDown);
    };
  }, [layout.cols, layout.rows]);

  const addRipple = (event, color) => {
    if (!boardRef.current) {
      return;
    }

    const rect = boardRef.current.getBoundingClientRect();
    const nextRipple = {
      id: rippleId.current,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      color,
    };

    rippleId.current += 1;
    setRipples((prev) => [...prev.slice(-12), nextRipple]);
  };

  return (
    <motion.div
      ref={boardRef}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerLeave={onLeave}
      style={{ rotateX, rotateY }}
      className={cn(
        "absolute inset-0 z-0 overflow-hidden [transform-style:preserve-3d]",
        className,
      )}
      {...rest}
    >
      <div
        className="absolute -inset-10 opacity-95"
        style={{
          transform:
            "translate(-5%,-18%) skewX(-38deg) skewY(12deg) scale(0.82) rotate(-2deg) translateZ(0)",
        }}
      >
        <div
          className="grid h-[130%] w-[120%]"
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((cell) => {
            const distance =
              activeCell == null
                ? 99
                : Math.hypot(
                    cell.col - activeCell.col,
                    cell.row - activeCell.row,
                  );
            const influence = Math.max(0, 1 - distance / 5.5);

            return (
              <motion.div
                key={cell.index}
                className="relative border-r border-t border-slate-700/55 transition-colors duration-300"
                style={{
                  backgroundColor:
                    influence > 0
                      ? `rgba(${activeColor}, ${0.08 + influence * 0.25})`
                      : "transparent",
                  boxShadow:
                    influence > 0.75
                      ? `inset 0 0 24px rgba(${activeColor},0.25), 0 0 16px rgba(${activeColor},0.28)`
                      : "none",
                }}
              />
            );
          })}
        </div>
      </div>

      <motion.div
        className="pointer-events-none absolute h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          opacity: glowOpacity,
          left: cursorX,
          top: cursorY,
          background: `radial-gradient(circle, rgba(${activeColor},0.45) 0%, rgba(${activeColor},0.08) 48%, rgba(15,23,42,0) 70%)`,
        }}
      />

      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ opacity: 0.7, scale: 0 }}
          animate={{ opacity: 0, scale: 7.2 }}
          transition={{ duration: 1.05, ease: "easeOut" }}
          onAnimationComplete={() => {
            setRipples((prev) => prev.filter((item) => item.id !== ripple.id));
          }}
          className="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            border: `1px solid rgba(${ripple.color}, 0.55)`,
            boxShadow: `0 0 40px rgba(${ripple.color},0.45)`,
          }}
        />
      ))}
    </motion.div>
  );
};

export const Boxes = React.memo(BoxesCore);
