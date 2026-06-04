'use client';

// SSR-safe localStorage-backed chat history hook.
// Accepts the storage key as an argument so the floating widget and the Ask
// page can use distinct localStorage namespaces while sharing the hook code.

import { useCallback, useEffect, useState } from 'react';
import type { ChatMessage } from './chatTypes';

function load(key: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(key: string, messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(messages));
  } catch {
    /* silent */
  }
}

export type UseChatHistoryResult = {
  messages: ChatMessage[];
  hydrated: boolean;
  append: (msg: ChatMessage) => void;
  appendMany: (msgs: ChatMessage[]) => void;
  clear: () => void;
  replaceLastAssistant: (msg: ChatMessage & { role: 'assistant' }) => void;
};

export function useChatHistory(storageKey: string): UseChatHistoryResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    setMessages(load(storageKey));
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    persist(storageKey, messages);
  }, [storageKey, messages, hydrated]);

  const append = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const appendMany = useCallback((msgs: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...msgs]);
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  const replaceLastAssistant = useCallback(
    (msg: ChatMessage & { role: 'assistant' }) => {
      setMessages((prev) => {
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].role === 'assistant') {
            const next = prev.slice();
            next[i] = msg;
            return next;
          }
        }
        return [...prev, msg];
      });
    },
    [],
  );

  return { messages, hydrated, append, appendMany, clear, replaceLastAssistant };
}
