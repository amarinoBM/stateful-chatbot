"use client";

import { motion } from "framer-motion";
import { BotIcon, UserIcon } from "./icons";
import { ReactNode } from "react";
import { StreamableValue, useStreamableValue } from "ai/rsc";
import { Markdown } from "./markdown";
import { Message as TMessage, ToolInvocation } from "ai";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { ReasoningStepDisplay } from "./ReasoningStepDisplay";
import { ToolResultDisplay } from "./ToolResultDisplay";

export const TextStreamMessage = ({
  content,
}: {
  content: StreamableValue;
}) => {
  const [text] = useStreamableValue(content);

  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
        <BotIcon />
      </div>

      <div className="flex flex-col gap-1 w-full">
        <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
          <Markdown>{text}</Markdown>
        </div>
      </div>
    </motion.div>
  );
};

export const Message = ({
  role,
  content,
  toolInvocations,
  reasoningMessages,
}: {
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  reasoningMessages: Array<TMessage>;
}) => {
  const usingTool = toolInvocations ?? false;
  const loading = content === "" && toolInvocations === undefined;
  
  // Extract reasoning steps
  const reasoningSteps: Array<ToolInvocation & {result?: any}> = [];
  
  if (toolInvocations) {
    toolInvocations.forEach((toolInvocation) => {
      if (
        toolInvocation.state === "result" && 
        (toolInvocation.toolName === "addAReasoningStep" || toolInvocation.toolName === "reasoningStep")
      ) {
        reasoningSteps.push(toolInvocation);
      }
    });
  }
  
  // Simple case: User message
  if (role === "user") {
    return <UserMessage content={content as string} />;
  }
  
  // Simple case: Assistant message with no tools
  if (role === "assistant" && !usingTool && content) {
    return <AssistantMessage content={content as string} />;
  }
  
  // Complex case: Assistant with tools and reasoning steps
  return (
    <motion.div
      className="flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {!usingTool && (
        <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
          <BotIcon />
        </div>
      )}

      <div className="flex flex-col gap-6 w-full">
        {/* Display reasoning steps at the top */}
        {reasoningSteps.length > 0 && (
          <div className="flex flex-col gap-6 w-full">
            {reasoningSteps.map((step, i) => (
              <ReasoningStepDisplay key={i} step={step.result} />
            ))}
          </div>
        )}
        
        {/* Display non-reasoning tool invocations */}
        {toolInvocations && toolInvocations.filter(t => 
          t.state === "result" && 
          t.toolName !== "addAReasoningStep" && 
          t.toolName !== "reasoningStep"
        ).map((tool, i) => (
          <ToolResultDisplay key={`tool-${i}`} tool={tool} />
        ))}
        
        {/* Show regular content if any, but hide it when proposeTaskIdeas tool is used */}
        {content && !(toolInvocations && toolInvocations.some(t => 
          t.state === "result" && 
          t.toolName === "proposeTaskIdeas"
        )) && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content as string}</Markdown>
          </div>
        )}
      </div>
    </motion.div>
  );
};
