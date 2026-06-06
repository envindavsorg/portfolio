import { useCallback, useEffect, useState } from "react";

import { m } from "@/paraglide/messages";

const useCopyToClipboard = (
  initialText = m.utils_copy_button_default()
) => {
  const [buttonText, setButtonText] = useState(initialText);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleCopy = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      setButtonText(m.utils_copy_button_success());
      const id = setTimeout(() => setButtonText(initialText), 1200);
      setTimeoutId(id);
    },
    [initialText]
  );

  useEffect(
    () => () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
    [timeoutId]
  );

  return { buttonText, handleCopy };
};

export default useCopyToClipboard;
