// hooks/useToast.ts
import { useState } from 'preact/hooks';

/** Toast Hook */
export default function useToast(duration = 2000) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  };

  return { message, showToast };
}
