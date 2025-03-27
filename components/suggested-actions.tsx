import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Message } from "ai";

type SuggestedAction = {
  title: string;
  label: string;
  action: string;
};

type SuggestionSets = {
  [key: string]: SuggestedAction[];
};

export function SuggestedActions({
  messages,
  isLoading,
  onActionClick,
  isNewSession,
}: {
  messages: Message[];
  isLoading: boolean;
  onActionClick: (action: string) => void;
  isNewSession?: boolean;
}) {
  const [suggestionType, setSuggestionType] = useState("start");
  
  // Reset suggestionType when starting a new session
  useEffect(() => {
    if (isNewSession) {
      setSuggestionType("start");
    }
  }, [isNewSession]);
  
  // Update suggestion type based on conversation state
  useEffect(() => {
    // If we have no messages, always show start suggestions
    if (messages.length === 0) {
      setSuggestionType("start");
      return;
    }
    
    // Check for tool calls that might indicate specific steps
    const hasTaskIdeas = messages.some(msg => 
      msg.toolInvocations?.some(tool => 
        tool.toolName === "proposeTaskIdeas" && tool.state === "result"
      )
    );
    
    if (hasTaskIdeas) {
      // Check if selection has been made
      const hasSelection = messages.some(msg => 
        msg.toolInvocations?.some(tool => 
          tool.toolName === "storeSelection" && 
          tool.state === "result" && 
          tool.result?.field === "selectedTaskIndex"
        )
      );
      
      if (!hasSelection) {
        setSuggestionType("selectIdea");
        return;
      }
    }
    
    // Only update the suggestion type when not loading
    if (!isLoading) {
      // Get the last assistant message
      const lastBotMessage = messages.filter(m => m.role === "assistant").pop();
      
      if (lastBotMessage?.content?.includes("which idea you would like to select")) {
        setSuggestionType("selectIdea");
      } else if (lastBotMessage?.content?.includes("focus topics")) {
        setSuggestionType("selectTopics");
      } else if (lastBotMessage?.content?.includes("product options")) {
        setSuggestionType("selectProducts");
      } else if (lastBotMessage?.content?.includes("requirements")) {
        setSuggestionType("approveRequirements");
      } else if (lastBotMessage?.content?.includes("rubric")) {
        setSuggestionType("approveRubric");
      } else if (messages.length > 0) {
        setSuggestionType("default");
      }
    }
  }, [messages, isLoading]);
  
  // Different suggestion sets based on conversation stage
  const suggestionSets: SuggestionSets = {
    start: [
      {
        title: "Create a performance task",
        label: "for English and Social Studies",
        action: "I want to create a mastery-based performance task that blends English and Social Studies",
      },
      {
        title: "Create a performance task",
        label: "for Math and Science",
        action: "I want to create a mastery-based performance task that blends Math and Science",
      },
      {
        title: "Create a performance task",
        label: "for Science",
        action: "I want to create a mastery-based performance task for Science",
      },
    ],
    default: [
      {
        title: "This looks great!",
        label: "Let's continue to the next step",
        action: "This looks great! Let's continue to the next step",
      },
      {
        title: "Can we refine this?",
        label: "Make it more engaging for students",
        action: "Can we refine this to make it more engaging for neurodiverse students?",
      },
      {
        title: "Start over",
        label: "with a different subject",
        action: "I'd like to start over with a different subject",
      },
    ],
    selectIdea: [
      {
        title: "I like the first idea",
        label: "Let's go with option 1",
        action: "I like the first idea. Let's go with that one.",
      },
      {
        title: "The second idea works best",
        label: "Option 2 is my choice",
        action: "The second idea works best for my students.",
      },
      {
        title: "I'll choose the third idea",
        label: "Option 3 looks promising",
        action: "I'll choose the third idea - it seems most engaging.",
      },
    ],
    selectTopics: [
      {
        title: "These topics look good",
        label: "I'll use topics 1, 3, and 5",
        action: "These topics look good. I'll use topics 1, 3, and 5.",
      },
      {
        title: "Can we add more STEM topics?",
        label: "Need more science focus",
        action: "Can we add more STEM-focused topics to the list?",
      },
      {
        title: "I'll use topics 2, 4, and 7",
        label: "These seem most relevant",
        action: "I'll use topics 2, 4, and 7 as they seem most relevant.",
      },
    ],
    approveRequirements: [
      {
        title: "These requirements look good",
        label: "Let's proceed to the next step",
        action: "These requirements look good. Let's proceed to the next step.",
      },
      {
        title: "Can we simplify the language?",
        label: "Make it more accessible",
        action: "Can we simplify the language to make it more accessible for neurodiverse learners?",
      },
      {
        title: "Add more visual components",
        label: "Include diagrams or graphics",
        action: "Could we add more visual components to the requirements?",
      },
    ],
  };
  
  // Get current suggestions based on state
  const currentSuggestions = suggestionSets[suggestionType] || suggestionSets.default;

  // Don't show any suggestions during loading except on the first message
  if (isLoading && messages.length > 0) {
    return null;
  }

  // Determine if we should show initial or in-conversation suggestions
  const shouldShowInitialSuggestions = messages.length === 0 || isNewSession;
  
  if (shouldShowInitialSuggestions) {
    // Initial suggestions
    return (
      <div className="grid sm:grid-cols-3 gap-2 w-full px-4 md:px-0 mx-auto md:max-w-[500px] mb-4">
        {suggestionSets.start.map((suggestedAction, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            key={index}
            className={index > 2 ? "hidden sm:block" : "block"}
          >
            <button
              onClick={() => onActionClick(suggestedAction.action)}
              className="w-full text-left border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-lg p-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col"
              disabled={isLoading}
            >
              <span className="font-medium">{suggestedAction.title}</span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {suggestedAction.label}
              </span>
            </button>
          </motion.div>
        ))}
      </div>
    );
  } else {
    // In-conversation suggestions
    return (
      <div className="grid sm:grid-cols-3 gap-2 w-full px-4 md:px-0 mx-auto md:max-w-[500px] mb-4">
        {currentSuggestions.map((suggestedAction, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            key={index}
            className={index > 2 ? "hidden sm:block" : "block"}
          >
            <button
              onClick={() => onActionClick(suggestedAction.action)}
              className="w-full text-left border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg p-2 text-sm hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors flex flex-col"
              disabled={isLoading}
            >
              <span className="font-medium">{suggestedAction.title}</span>
              <span className="text-blue-600 dark:text-blue-400">
                {suggestedAction.label}
              </span>
            </button>
          </motion.div>
        ))}
      </div>
    );
  }
} 