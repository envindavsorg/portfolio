import { useCallback, useRef } from "react";

const useAnimatedRef = () => {
  const ref = useRef<AnimatedIconHandle>(null);

  const handleMouseEnter = useCallback(
    () => ref.current?.startAnimation(),
    []
  );
  const handleMouseLeave = useCallback(
    () => ref.current?.stopAnimation(),
    []
  );

  return { handleMouseEnter, handleMouseLeave, ref } as const;
};

export default useAnimatedRef;
