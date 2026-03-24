import { useAnimation } from "motion/react";
import { useCallback, useImperativeHandle, useRef } from "react";
import type { ForwardedRef } from "react";

const useAnimatedIcon = (
  ref: ForwardedRef<AnimatedIconHandle>,
  onMouseEnter?: (event: AnimatedIconEvent) => void,
  onMouseLeave?: (event: AnimatedIconEvent) => void,
  customBehavior?: {
    startAnimation?: () => void;
    stopAnimation?: () => void;
  }
) => {
  const controls = useAnimation();
  const isControlledRef = useRef(false);

  const startAnim =
    customBehavior?.startAnimation ||
    (() => controls.start("animate"));
  const stopAnim =
    customBehavior?.stopAnimation || (() => controls.start("normal"));

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;
    return {
      startAnimation: startAnim,
      stopAnimation: stopAnim,
    };
  });

  const handleMouseEnter = useCallback(
    (event: AnimatedIconEvent) => {
      onMouseEnter?.(event);
      if (!isControlledRef.current) {
        startAnim();
      }
    },
    [onMouseEnter, startAnim]
  );

  const handleMouseLeave = useCallback(
    (event: AnimatedIconEvent) => {
      onMouseLeave?.(event);
      if (!isControlledRef.current) {
        stopAnim();
      }
    },
    [onMouseLeave, stopAnim]
  );

  return {
    controls,
    handleMouseEnter,
    handleMouseLeave,
  };
};

export default useAnimatedIcon;
