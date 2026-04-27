"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { CHAT_TURN_CAP, STORAGE_KEYS } from "./constants";
import { trackChatEvent } from "./analytics";
import type { ChatMessage, Lead } from "./types";

// ---------- State ----------

type ChatState = {
  open: boolean;
  messages: ChatMessage[];
  lead: Lead | null;
  contactNudgeShown: boolean;
  isSending: boolean;
  hydrated: boolean;
};

const INITIAL_GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content: "Hi 👋 I'm 2KO's systems specialist. What would you like help with?",
  createdAt: new Date(0).toISOString(),
};

const INITIAL_STATE: ChatState = {
  open: false,
  messages: [INITIAL_GREETING],
  lead: null,
  contactNudgeShown: false,
  isSending: false,
  hydrated: false,
};

type Action =
  | { type: "HYDRATE"; payload: Partial<ChatState> }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "ADD_MESSAGE"; message: ChatMessage }
  | { type: "REPLACE_LAST_ASSISTANT"; message: ChatMessage }
  | { type: "SET_SENDING"; value: boolean }
  | { type: "SET_LEAD"; lead: Lead | null }
  | { type: "MARK_CONTACT_NUDGE_SHOWN" }
  | { type: "RESET" };

function reducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, hydrated: true };
    case "OPEN":
      return { ...state, open: true };
    case "CLOSE":
      return { ...state, open: false };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    case "REPLACE_LAST_ASSISTANT": {
      // Used to swap a typing-indicator placeholder for the real reply.
      const next = [...state.messages];
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].role === "assistant") {
          next[i] = action.message;
          break;
        }
      }
      return { ...state, messages: next };
    }
    case "SET_SENDING":
      return { ...state, isSending: action.value };
    case "SET_LEAD":
      return { ...state, lead: action.lead };
    case "MARK_CONTACT_NUDGE_SHOWN":
      return { ...state, contactNudgeShown: true };
    case "RESET":
      return { ...INITIAL_STATE, hydrated: true };
    default:
      return state;
  }
}

// ---------- Context value ----------

type ChatContextValue = {
  state: ChatState;
  /** User-turn count, derived. Hard cap at CHAT_TURN_CAP. */
  userTurns: number;
  capReached: boolean;
  open: () => void;
  close: () => void;
  addUserMessage: (content: string) => ChatMessage;
  addAssistantMessage: (content: string, intent?: ChatMessage["intent"]) => ChatMessage;
  replaceLastAssistant: (content: string, intent?: ChatMessage["intent"]) => void;
  setSending: (value: boolean) => void;
  setLead: (lead: Lead | null) => void;
  markContactNudgeShown: () => void;
  resetSession: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

// ---------- Provider ----------

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const hydratedRef = useRef(false);

  // Hydrate from sessionStorage on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawMessages = sessionStorage.getItem(STORAGE_KEYS.messages);
      const rawLead = sessionStorage.getItem(STORAGE_KEYS.lead);
      const rawOpen = sessionStorage.getItem(STORAGE_KEYS.open);
      const rawNudge = sessionStorage.getItem(STORAGE_KEYS.contactNudgeShown);

      const payload: Partial<ChatState> = {};
      if (rawMessages) {
        const parsed = JSON.parse(rawMessages) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) payload.messages = parsed;
      }
      if (rawLead) payload.lead = JSON.parse(rawLead) as Lead;
      if (rawOpen === "true") payload.open = true;
      if (rawNudge === "true") payload.contactNudgeShown = true;

      dispatch({ type: "HYDRATE", payload });
    } catch {
      dispatch({ type: "HYDRATE", payload: {} });
    }
    hydratedRef.current = true;
  }, []);

  // Persist on changes.
  useEffect(() => {
    if (!state.hydrated || typeof window === "undefined") return;
    try {
      sessionStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(state.messages));
      if (state.lead) {
        sessionStorage.setItem(STORAGE_KEYS.lead, JSON.stringify(state.lead));
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.lead);
      }
      sessionStorage.setItem(STORAGE_KEYS.open, state.open ? "true" : "false");
      sessionStorage.setItem(
        STORAGE_KEYS.contactNudgeShown,
        state.contactNudgeShown ? "true" : "false"
      );
    } catch {
      // sessionStorage may be unavailable in some embeds — fail silent.
    }
  }, [state]);

  const userTurns = useMemo(
    () => state.messages.filter((m) => m.role === "user").length,
    [state.messages]
  );

  const capReached = userTurns >= CHAT_TURN_CAP;

  const open = useCallback(() => {
    dispatch({ type: "OPEN" });
    trackChatEvent("chat_opened");
  }, []);

  const close = useCallback(() => {
    dispatch({ type: "CLOSE" });
    trackChatEvent("chat_closed");
  }, []);

  const addUserMessage = useCallback((content: string): ChatMessage => {
    const message: ChatMessage = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_MESSAGE", message });
    return message;
  }, []);

  const addAssistantMessage = useCallback(
    (content: string, intent?: ChatMessage["intent"]): ChatMessage => {
      const message: ChatMessage = {
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: "assistant",
        content,
        createdAt: new Date().toISOString(),
        intent,
      };
      dispatch({ type: "ADD_MESSAGE", message });
      return message;
    },
    []
  );

  const replaceLastAssistant = useCallback(
    (content: string, intent?: ChatMessage["intent"]) => {
      const message: ChatMessage = {
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: "assistant",
        content,
        createdAt: new Date().toISOString(),
        intent,
      };
      dispatch({ type: "REPLACE_LAST_ASSISTANT", message });
    },
    []
  );

  const setSending = useCallback((value: boolean) => {
    dispatch({ type: "SET_SENDING", value });
  }, []);

  const setLead = useCallback((lead: Lead | null) => {
    dispatch({ type: "SET_LEAD", lead });
    if (lead) trackChatEvent("lead_details_submitted");
  }, []);

  const markContactNudgeShown = useCallback(() => {
    dispatch({ type: "MARK_CONTACT_NUDGE_SHOWN" });
  }, []);

  const resetSession = useCallback(() => {
    dispatch({ type: "RESET" });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEYS.messages);
      sessionStorage.removeItem(STORAGE_KEYS.lead);
      sessionStorage.removeItem(STORAGE_KEYS.open);
      sessionStorage.removeItem(STORAGE_KEYS.contactNudgeShown);
    }
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      state,
      userTurns,
      capReached,
      open,
      close,
      addUserMessage,
      addAssistantMessage,
      replaceLastAssistant,
      setSending,
      setLead,
      markContactNudgeShown,
      resetSession,
    }),
    [
      state,
      userTurns,
      capReached,
      open,
      close,
      addUserMessage,
      addAssistantMessage,
      replaceLastAssistant,
      setSending,
      setLead,
      markContactNudgeShown,
      resetSession,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
