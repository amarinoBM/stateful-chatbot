import { ToolInvocation } from "ai";

// Task Ideas display component
function TaskIdeasDisplay({ result }: { result: any }) {
  console.log("[DEBUG TaskIdeasDisplay] Received result:", JSON.stringify(result));
  
  // Check if result is valid
  if (!result) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Task Ideas</h3>
        <p className="text-amber-600 dark:text-amber-400 font-medium p-3 bg-amber-50 dark:bg-amber-900/30 rounded-md">
          No task ideas available. The assistant will generate ideas for you.
        </p>
      </div>
    );
  }
  
  // Handle different possible formats for ideas
  let ideas = null;
  
  // Option 1: Direct ideas array in result
  if (result.ideas && Array.isArray(result.ideas)) {
    ideas = result.ideas;
  } 
  // Option 2: Ideas in taskIdeas field
  else if (result.taskIdeas && Array.isArray(result.taskIdeas)) {
    ideas = result.taskIdeas;
  }
  
  // Check if result is an error message
  const isErrorResult = 
    (typeof result === 'string' && result.includes("An error occurred")) ||
    (result && typeof result === 'object' && result.error);
  
  // If we have no ideas but there's a selection, we should show a message
  const hasSelection = result.selectedTaskIndex !== undefined;
  const noIdeasButSelection = hasSelection && (!ideas || !Array.isArray(ideas) || ideas.length === 0);

  // Validate each idea has title and description
  const validIdeas = Array.isArray(ideas) ? ideas.filter((idea: any) => 
    idea && typeof idea === 'object' && 
    typeof idea.title === 'string' && 
    typeof idea.description === 'string'
  ) : [];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Task Ideas</h3>
      {isErrorResult ? (
        <p className="text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/30 rounded-md">
          There was an error generating task ideas. The assistant will try again.
        </p>
      ) : validIdeas.length > 0 ? (
        <>
          {validIdeas.map((idea: any, i: number) => (
            <div key={i} className="mb-4 p-3 border border-gray-200 dark:border-gray-800 rounded-md">
              <div className="font-medium">{i + 1}. {idea.title}</div>
              <div className="text-zinc-600 dark:text-zinc-400">{idea.description}</div>
            </div>
          ))}
          
          {hasSelection && (
            <p className="text-green-600 font-medium mt-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-md">
              Selected task: {parseInt(String(result.selectedTaskIndex)) + 1}
            </p>
          )}
          
          {!hasSelection && (
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
              Please let me know which idea you would like to select!
            </p>
          )}
        </>
      ) : (
        <>
          <p className="text-amber-600 dark:text-amber-400 font-medium p-3 bg-amber-50 dark:bg-amber-900/30 rounded-md">
            {noIdeasButSelection 
              ? "A task selection was attempted, but no ideas were provided. The assistant will generate ideas first."
              : "The assistant is generating task ideas for you..."}
          </p>
        </>
      )}
    </div>
  );
}

// Focus Topics display component
function FocusTopicsDisplay({ result }: { result: any }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Focus Topics</h3>
      {result.topics && Array.isArray(result.topics) ? (
        <ol className="list-decimal pl-5">
          {result.topics.map((topic: string, i: number) => (
            <li key={i} className="mb-1">{topic}</li>
          ))}
        </ol>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400">No focus topics available</p>
      )}
      {result.selectedFocusTopics && Array.isArray(result.selectedFocusTopics) && result.selectedFocusTopics.length > 0 && (
        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900 rounded-md">
          <p className="font-medium text-green-700 dark:text-green-300">Selected topics:</p>
          <ul className="list-disc pl-5 text-green-700 dark:text-green-300">
            {result.selectedFocusTopics.map((topic: string, i: number) => (
              <li key={i}>{topic}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-zinc-500 dark:text-zinc-400 mt-2">
        Please select one or more focus topics that interest you.
      </p>
    </div>
  );
}

// Product Options display component
function ProductOptionsDisplay({ result }: { result: any }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Product Options</h3>
      {result.options && Array.isArray(result.options) ? (
        <ol className="list-decimal pl-5">
          {result.options.map((option: string, i: number) => (
            <li key={i} className="mb-1">{option}</li>
          ))}
        </ol>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400">No product options available</p>
      )}
      {result.selectedProductOptions && Array.isArray(result.selectedProductOptions) && result.selectedProductOptions.length > 0 && (
        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900 rounded-md">
          <p className="font-medium text-green-700 dark:text-green-300">Selected products:</p>
          <ul className="list-disc pl-5 text-green-700 dark:text-green-300">
            {result.selectedProductOptions.map((option: string, i: number) => (
              <li key={i}>{option}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-zinc-500 dark:text-zinc-400 mt-2">
        Please select 1-5 product options for this task.
      </p>
    </div>
  );
}

// Requirements display component
function RequirementsDisplay({ result }: { result: any }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Task Requirements</h3>
      {result.overview && (
        <div className="mb-4">
          <p className="font-medium">Overview:</p>
          <p className="text-zinc-600 dark:text-zinc-400">{result.overview}</p>
        </div>
      )}
      {result.steps && Array.isArray(result.steps) && (
        <div>
          <p className="font-medium">Steps:</p>
          <ol className="list-decimal pl-5 text-zinc-600 dark:text-zinc-400">
            {result.steps.map((step: string, i: number) => (
              <li key={i} className="mb-1">{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// Rubric display component
function RubricDisplay({ result }: { result: any }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{result.title || "Rubric"}</h3>
      {result.description && (
        <p className="text-zinc-600 dark:text-zinc-400 mb-3">{result.description}</p>
      )}
      {result.criteria && Array.isArray(result.criteria) && (
        <div className="space-y-4">
          {result.criteria.map((criterion: any, i: number) => (
            <div key={i} className="border dark:border-zinc-700 rounded p-3">
              <p className="font-medium mb-2">{criterion.skill}</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded">
                  <p className="font-medium text-red-700 dark:text-red-300 text-xs">Try</p>
                  <p className="text-xs">{criterion.levels.try}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded">
                  <p className="font-medium text-yellow-700 dark:text-yellow-300 text-xs">Relevant</p>
                  <p className="text-xs">{criterion.levels.relevant}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded">
                  <p className="font-medium text-green-700 dark:text-green-300 text-xs">Accurate</p>
                  <p className="text-xs">{criterion.levels.accurate}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                  <p className="font-medium text-blue-700 dark:text-blue-300 text-xs">Complex</p>
                  <p className="text-xs">{criterion.levels.complex}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Final JSON display component
function FinalJSONDisplay({ result }: { result: any }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Final Performance Task</h3>
      {result.finalOutput && (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded overflow-auto max-h-[500px]">
          <pre className="text-xs">{result.finalOutput}</pre>
        </div>
      )}
      <p className="text-green-600 font-medium mt-4">
        Congratulations! Your performance task is complete.
      </p>
    </div>
  );
}

// Main ToolResultDisplay component
export function ToolResultDisplay({ tool }: { tool: ToolInvocation }) {
  console.log("[DEBUG ToolResultDisplay] Received tool:", tool.toolName, "State:", tool.state);
  if (tool.state === "result" && tool.result) {
    console.log("[DEBUG ToolResultDisplay] Tool result:", JSON.stringify(tool.result));
  }
  
  // Don't display reasoning steps here since they're handled separately
  if (tool.toolName === "addAReasoningStep" || tool.toolName === "reasoningStep") {
    return null;
  }
  
  // Map tool names to their display components
  const toolDisplays: Record<string, React.FC<{result: any}>> = {
    proposeTaskIdeas: TaskIdeasDisplay,
    provideFocusTopics: FocusTopicsDisplay,
    presentProductOptions: ProductOptionsDisplay,
    defineRequirements: RequirementsDisplay,
    createRubric: RubricDisplay,
    generateFinalJSON: FinalJSONDisplay
  };
  
  // Get the appropriate display component
  const DisplayComponent = tool.toolName && toolDisplays[tool.toolName];
  
  // Handle error state
  const errorOccurred = 
    (tool.state === "result" && typeof tool.result === 'string' && tool.result.includes("An error occurred")) ||
    (tool.state === "result" && 'error' in tool);
  
  return (
    <div className="border dark:border-zinc-700 rounded-lg p-4 text-sm mt-4">
      <div className="flex flex-row">
        <div className={`inline-block ${errorOccurred ? 'bg-red-600' : 'bg-green-600'} text-white text-xs py-1 px-2 rounded`}>
          {tool.toolName}
        </div>
      </div>
      
      {errorOccurred ? (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
          <p className="font-medium">An error occurred while processing {tool.toolName}</p>
          <p className="mt-1">The assistant will try again. If this persists, try refreshing the page or starting a new conversation.</p>
        </div>
      ) : tool.state === "result" && tool.result ? (
        <div className="mt-3">
          {DisplayComponent ? (
            <DisplayComponent result={tool.result} />
          ) : (
            <div className="text-zinc-600 dark:text-zinc-400">
              Result: {JSON.stringify(tool.result, null, 2)}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 text-zinc-600 dark:text-zinc-400">
          Processing...
        </div>
      )}
    </div>
  );
} 