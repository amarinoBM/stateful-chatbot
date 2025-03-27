"use client";

import { useRef, useEffect, useState } from "react";
import { Message } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { motion } from "framer-motion";
import Link from "next/link";
import { useChat } from "ai/react";
import { SuggestedActions } from "@/components/suggested-actions";

export default function Page() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(true);
  
  // Clear session when explicitly starting a new conversation
  const startNewConversation = () => {
    setSessionId(null);
    window.location.reload();
  };

  // Custom chat configuration with session ID handling
  const { messages, handleSubmit, input, setInput, append, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: (sessionId) ? [{ 
      id: 'system-1',
      role: 'system', 
      content: `Session-ID: ${sessionId}\nThis is a performance task builder assistant.` 
    }] : [],
    id: sessionId || undefined,
    onResponse: (response: Response) => {
      // Store session ID from headers if present
      const responseSessionId = response.headers.get('X-Session-ID');
      if (responseSessionId) {
        console.log('[Client] Received session ID:', responseSessionId);
        setSessionId(responseSessionId);
      }
    },
    headers: sessionId ? { 'X-Session-ID': sessionId } : {}
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div className="flex flex-row justify-center pb-20 h-dvh bg-white dark:bg-zinc-900">
      <div className="flex flex-col justify-between gap-4">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-6 h-full w-dvw items-center overflow-y-scroll"
        >
          {messages.length === 0 && !sessionId && (
            <motion.div className="h-[350px] px-4 w-full md:w-[500px] md:px-0 pt-20">
              <div className="border rounded-lg p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
                <h2 className="text-xl font-bold text-center text-zinc-900 dark:text-zinc-50 mb-2">
                  Performance Task Builder
                </h2>
                <p className="text-center mb-2">
                  Design curriculum performance tasks for neurodiverse learners
                </p>
                <div className="text-sm px-4">
                  <p className="mb-2">This tool will guide you through a 6-step process:</p>
                  <ol className="list-decimal list-inside space-y-1 text-left ml-2">
                    <li>Generate GRASPS-aligned task ideas</li>
                    <li>Create diverse focus topics</li>
                    <li>Present product options</li>
                    <li>Define student requirements</li>
                    <li>Create assessment rubrics</li>
                    <li>Generate final task output</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          )}

          {messages.filter((m: any) => m.role !== 'system').map((message: any, i: number) => {
            return (
              <Message
                key={message.id}
                role={message.role}
                content={message.content}
                toolInvocations={message.toolInvocations}
                reasoningMessages={[]}
              ></Message>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested actions component with loading awareness */}
        <SuggestedActions 
          messages={messages} 
          isLoading={isLoading}
          isNewSession={!sessionId || messages.length === 0}
          onActionClick={(action) => {
            append({
              role: "user",
              content: action,
            });
          }} 
        />

        <form
          className="flex flex-col gap-2 relative items-center"
          onSubmit={handleSubmit}
        >
          <div className="flex w-full justify-between mb-2 md:max-w-[500px]">
            <div className="text-xs text-zinc-500">
              {sessionId ? `Session: ${sessionId.substring(0, 8)}...` : 'New session'}
            </div>
            <button 
              type="button"
              onClick={startNewConversation}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Reset Session
            </button>
          </div>
          
          <input
            ref={inputRef}
            className="bg-zinc-100 rounded-md px-2 py-1.5 w-full outline-none dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300 md:max-w-[500px] max-w-[calc(100dvw-32px)]"
            placeholder="Send a message..."
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
          />
        </form>
      </div>
    </div>
  );
}
