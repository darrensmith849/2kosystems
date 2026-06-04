// Public barrel for the floating-chat module.
// The Ask page (Track C) imports shared primitives from here so we don't
// duplicate chat UI between the floating widget and the full-page client.

export { FloatingChat } from './FloatingChat';
export { ChatPanel } from './ChatPanel';
export { ChatBubbles, renderMarkdownLite } from './ChatBubbles';
export { ChatComposer } from './ChatComposer';
export { SourceCards } from './SourceCards';
export { SuggestedPrompts } from './SuggestedPrompts';
export { useChatHistory } from './useChatHistory';
export { postQuery } from './postQuery';
export {
  SUGGESTED_PROMPTS,
  WARNING_LABEL,
  WARNING_TONE,
} from './chatTypes';
export type {
  ChatMessage,
  ChatStage,
  PageContext,
  AssistantAnswer,
  AssistantSource,
  AssistantWarning,
} from './chatTypes';
export type { ChatPanelProps } from './ChatPanel';
export type { ChatComposerProps } from './ChatComposer';
export type { ChatBubblesProps } from './ChatBubbles';
export type { SuggestedPromptsProps } from './SuggestedPrompts';
export type { PostQueryOptions } from './postQuery';
export type { UseChatHistoryResult } from './useChatHistory';
