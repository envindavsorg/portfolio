"use client";

import type { HTMLAttributes } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface FlickeringGridProps extends HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
}

export const FlickeringGrid = ({
  squareSize = 4,
  gridGap = 4,
  flickerChance = 0.1,
  color = "#6B7280",
  // pas de valeur par defaut : `width || container.clientWidth` ne mesurait
  // jamais le conteneur, donc la grille dessinait 800x800 (soit 10 000 carres
  // par image) dans une bande d'en-tete de quelques dizaines de pixels.
  width,
  height,
  className: _className,
  maxOpacity = 0.4,
  ...props
}: FlickeringGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({
    height: 0,
    width: 0,
  });
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const memoizedColor = useMemo(() => {
    const toRGBA = (colorValue: string) => {
      if (typeof window === "undefined") {
        return "rgba(0, 0, 0,";
      }
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return "rgba(255, 0, 0,";
      }
      ctx.fillStyle = colorValue;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = [...ctx.getImageData(0, 0, 1, 1).data];
      return `rgba(${r}, ${g}, ${b},`;
    };
    return toRGBA(color);
  }, [color]);

  const setupCanvas = useCallback(
    (
      canvas: HTMLCanvasElement,
      canvasWidth: number,
      canvasHeight: number
    ) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      const cols = Math.floor(canvasWidth / (squareSize + gridGap));
      const rows = Math.floor(canvasHeight / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i += 1) {
        squares[i] = Math.random() * maxOpacity;
      }

      return { cols, dpr, rows, squares };
    },
    [squareSize, gridGap, maxOpacity]
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i += 1) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity]
  );

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      canvasWidth: number,
      canvasHeight: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number
    ) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      for (let i = 0; i < cols; i += 1) {
        for (let j = 0; j < rows; j += 1) {
          const opacity = squares[i * rows + j];
          ctx.fillStyle = `${memoizedColor}${opacity})`;
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr
          );
        }
      }
    },
    [memoizedColor, squareSize, gridGap]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!(canvas && container)) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let animationFrameId: number;
    let gridParams!: ReturnType<typeof setupCanvas>;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ height: newHeight, width: newWidth });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) {
        return;
      }

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      updateSquares(gridParams.squares, deltaTime);
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    intersectionObserver.observe(canvas);

    if (prefersReducedMotion) {
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr
      );
    } else if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [
    setupCanvas,
    updateSquares,
    drawGrid,
    width,
    height,
    isInView,
    prefersReducedMotion,
  ]);

  return (
    <div className="relative flex grow overflow-hidden">
      <div
        className="absolute inset-0 z-0 h-full w-full"
        ref={containerRef}
        {...props}
      >
        {/*
          Fond animé purement décoratif, et `pointer-events-none`.

          Biome range `<canvas>` parmi les éléments focusables, ce qu'il n'est
          pas : la spec HTML ne lui donne aucun mode de focus par défaut, sans
          `tabindex` ni contenu de repli focusable. Son correctif automatique
          consiste à RETIRER `aria-hidden`, ce qui exposerait un canvas sans nom
          aux lecteurs d'écran — strictement pire que la situation actuelle.
        */}
        {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: un canvas décoratif sans tabindex n'est pas focusable */}
        <canvas
          aria-hidden="true"
          className="pointer-events-none"
          ref={canvasRef}
          style={{
            height: canvasSize.height,
            width: canvasSize.width,
          }}
        />
      </div>
    </div>
  );
};
