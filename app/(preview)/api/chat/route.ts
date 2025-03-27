import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { v4 as uuidv4 } from 'uuid';
import { getSessionData, updateSessionData, validateAndAdvanceStep } from "@/lib/session";
import { getSystemPrompt, getStepTools, stepValidators, StepNumber } from "@/lib/steps";
import { z } from "zod";

// Types for improved type safety
type ToolResult = {
  [key: string]: any;
  __forceValidate?: boolean;
};

type ToolProcessingResult = ToolResult | null;

// Constants
const TOOL_NAMES = {
  REASONING: "addAReasoningStep",
  TASK_IDEAS: "proposeTaskIdeas",
  FOCUS_TOPICS: "provideFocusTopics",
  PRODUCT_OPTIONS: "presentProductOptions",
  REQUIREMENTS: "defineRequirements",
  RUBRIC: "createRubric",
  FINAL_JSON: "generateFinalJSON"
};

// ===========================
// Tool Processing Functions
// ===========================

/**
 * Process task ideas from tool call result
 * Handles both task ideas generation and selection
 */
function processTaskIdeas(toolCall: any, sessionData: any) {
  console.log("[DEBUG] Processing task ideas:", JSON.stringify(toolCall).substring(0, 100) + "...");
  
  if (!toolCall || !toolCall.result) {
    console.error("[ERROR] Invalid tool call or missing result in processTaskIdeas");
    return {};
  }
  
  // Handle string results (error cases or unexpected formats)
  if (typeof toolCall.result === 'string') {
    console.log("[DEBUG] Received string result in processTaskIdeas:", toolCall.result.substring(0, 100));
    return {};
  }
  
  const result = toolCall.result;
  let taskIdeas = [];
  
  // Try to extract ideas from different possible locations
  if (Array.isArray(result.ideas)) {
    taskIdeas = result.ideas;
  } else if (Array.isArray(result.taskIdeas)) {
    taskIdeas = result.taskIdeas;
  } else if (result.ideas && typeof result.ideas === 'object' && !Array.isArray(result.ideas)) {
    // Handle case where ideas might be an object instead of array
    console.log("[DEBUG] Converting ideas object to array");
    taskIdeas = Object.values(result.ideas);
  }
  
  // Validate each idea has required properties
  const validIdeas = taskIdeas.filter((idea: any) => 
    idea && 
    typeof idea === 'object' && 
    typeof idea.title === 'string' && 
    typeof idea.description === 'string'
  );
  
  console.log("[DEBUG] Valid task ideas count:", validIdeas.length);
  
  // Process selectedTaskIndex if present and ideas exist
  if (result.selectedTaskIndex !== undefined) {
    if (validIdeas.length === 0) {
      console.warn("[WARN] selectedTaskIndex provided but no valid ideas found");
      return { taskIdeas: validIdeas };
    }
    
    const selectedIndex = parseInt(String(result.selectedTaskIndex));
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= validIdeas.length) {
      console.warn("[WARN] Invalid selectedTaskIndex:", result.selectedTaskIndex);
      return { taskIdeas: validIdeas };
    }
    
    console.log("[DEBUG] Selected task index:", selectedIndex);
    
    // Store the selected task in the session
    sessionData.selectedTask = validIdeas[selectedIndex];
    
    return {
      taskIdeas: validIdeas,
      selectedTaskIndex: selectedIndex
    };
  }
  
  return { taskIdeas: validIdeas };
}

/**
 * Process focus topics tool results
 * Handles both focus topics generation and selection
 */
function processFocusTopics(toolCall: any): ToolResult {
  const result: ToolResult = {};
  
  // Always store the focus topics
  if (toolCall.result.topics) {
    console.log('[Focus Topics]', JSON.stringify(toolCall.result.topics).substring(0, 100) + '...');
    result.focusTopics = toolCall.result.topics;
  }
  
  // Store the selection if provided
  if (toolCall.result.selectedFocusTopics?.length) {
    console.log('[Focus Topics Selection]', toolCall.result.selectedFocusTopics);
    result.selectedFocusTopics = toolCall.result.selectedFocusTopics;
    result.__forceValidate = true;
  }
  
  return result;
}

/**
 * Process product options tool results
 * Handles both product options generation and selection
 */
function processProductOptions(toolCall: any): ToolResult {
  const result: ToolResult = {};
  
  // Always store the product options
  if (toolCall.result.options) {
    console.log('[Product Options]', JSON.stringify(toolCall.result.options).substring(0, 100) + '...');
    result.productOptions = toolCall.result.options;
  }
  
  // Store the selection if provided
  if (toolCall.result.selectedProductOptions?.length) {
    console.log('[Product Options Selection]', toolCall.result.selectedProductOptions);
    result.selectedProductOptions = toolCall.result.selectedProductOptions;
    result.__forceValidate = true;
  }
  
  return result;
}

/**
 * Process requirements tool results
 */
function processRequirements(toolCall: any): ToolResult {
  console.log('[Requirements]', 'Defined');
  return { requirements: toolCall.result };
}

/**
 * Process rubric tool results
 */
function processRubric(toolCall: any): ToolResult {
  console.log('[Rubric]', 'Created');
  return { rubric: toolCall.result };
}

/**
 * Process final JSON tool results
 */
function processFinalJSON(toolCall: any): ToolResult {
  console.log('[Final JSON]', 'Generated');
  return { finalOutput: toolCall.result };
}

// ===========================
// Helper Functions
// ===========================

/**
 * Helper to extract session ID from messages
 */
function extractSessionId(messages: any[]): string | null {
  // Check system message for session ID
  const systemMessage = messages.find(m => m.role === 'system');
  if (systemMessage?.content) {
    const match = systemMessage.content.match(/Session-ID: ([a-f0-9-]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Check metadata in any message
  for (const message of messages) {
    if (message.metadata?.sessionId) {
      return message.metadata.sessionId;
    }
  }
  
  return null;
}

/**
 * Helper to extract tool results from messages
 */
function extractToolResults(messages: any[]): ToolProcessingResult {
  console.log('[DEBUG] Scanning messages for tool invocations, message count:', messages.length);
  
  try {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant') {
        console.log('[DEBUG] Found assistant message, has toolInvocations:', !!msg.toolInvocations);
        
        if (msg.toolInvocations?.length > 0) {
          const toolCall = msg.toolInvocations[0];
          console.log('[Tool Call]', toolCall.toolName);
          console.log('[DEBUG] Found tool invocation:', toolCall.toolName, 'State:', toolCall.state);
          console.log('[DEBUG] Tool call entire structure:', JSON.stringify(toolCall));
          
          // Check if the tool call has a result
          if (!toolCall.result) {
            console.log('[DEBUG] No result found for tool call:', toolCall.toolName);
            continue; // Skip if no result
          }
          
          // Check for error result (string error message)
          if (typeof toolCall.result === 'string' && toolCall.result.includes("An error occurred")) {
            console.error(`[ERROR] Error in tool call ${toolCall.toolName}: ${toolCall.result}`);
            return null; // Return null to skip processing this tool call
          }
          
          // Use dedicated processing functions for each tool type
          try {
            switch (toolCall.toolName) {
              case TOOL_NAMES.TASK_IDEAS:
                const sessionId = extractSessionId(messages);
                return processTaskIdeas(toolCall, sessionId ? getSessionData(sessionId) : {});
                
              case TOOL_NAMES.FOCUS_TOPICS:
                return processFocusTopics(toolCall);
                
              case TOOL_NAMES.PRODUCT_OPTIONS:
                return processProductOptions(toolCall);
                
              case TOOL_NAMES.REQUIREMENTS:
                return processRequirements(toolCall);
                
              case TOOL_NAMES.RUBRIC:
                return processRubric(toolCall);
                
              case TOOL_NAMES.FINAL_JSON:
                return processFinalJSON(toolCall);
            }
          } catch (processingError: any) {
            console.error(`[ERROR] Error processing tool ${toolCall.toolName}:`, processingError);
            throw new Error(`Error processing tool ${toolCall.toolName}: ${processingError.message}`);
          }
        } else {
          console.log('[DEBUG] No tool invocations in this assistant message');
        }
      }
    }
  } catch (error) {
    console.error('[ERROR] Error in extractToolResults:', error);
  }
  
  console.log('[DEBUG] No tool invocations found in messages');
  return null;
}

/**
 * Generate the instructions for the LLM based on the current session state
 */
function generateInstructions(sessionData: any): string {
  const step = sessionData.currentStep;
  
  let stepSpecificInstructions = '';
  if (step === 1) {
    stepSpecificInstructions = `
For step 1, you MUST:
1. ALWAYS generate three complete task ideas (title and description for each)
2. Only add a selectedTaskIndex when the user explicitly selects a task
3. NEVER set selectedTaskIndex without providing ideas
`;
  }

  return `
Important: You MUST follow these steps in exact order when responding:
1. Analyze the task using addAReasoningStep (1-2 steps maximum)
2. IMMEDIATELY call the appropriate tool for the current step
3. Do not respond with additional text - ONLY use the tool

Current step: ${sessionData.currentStep}
Step completion status: ${sessionData.stepComplete ? "complete" : "incomplete"}

${stepSpecificInstructions}
For step 1, you MUST call proposeTaskIdeas after your reasoning.
For step 2, you MUST call provideFocusTopics after your reasoning.
For step 3, you MUST call presentProductOptions after your reasoning.
For step 4, you MUST call defineRequirements after your reasoning.
For step 5, you MUST call createRubric after your reasoning.
For step 6, you MUST call generateFinalJSON after your reasoning.

IMPORTANT: If the user selects a task idea, focus topic, or product option, use the appropriate tool with the selection parameter included.
Do not call the same tool twice in sequence. Include selections directly in the original tool.

CRITICAL: Always end your response with an appropriate tool call - this is MANDATORY.
`;
}

// The reasoning step tool that is available in all steps
const reasoningStepTool = {
  [TOOL_NAMES.REASONING]: {
    description: "Annotate your reasoning process with step-by-step explanations.",
    parameters: z.object({
      title: z.string().describe("The title of the reasoning step"),
      content: z.string().describe("The content of the reasoning step."),
      nextStep: z.enum(["continue", "finalAnswer"]).describe(
        "Whether to continue with another step or provide the final answer",
      ),
    }),
    execute: async (params: { title: string; content: string; nextStep: "continue" | "finalAnswer" }) => params,
  }
};

// ===========================
// Main API Handler
// ===========================

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const lastMessage = messages[messages.length - 1];
    
    // ----------------
    // 1. SESSION MANAGEMENT
    // ----------------
    // Extract or create session ID
    let sessionId = extractSessionId(messages) || request.headers.get('X-Session-ID');
    if (!sessionId) {
      sessionId = uuidv4();
      console.log('[Session] Created new session ID:', sessionId);
    } else {
      console.log('[Session] Using existing session ID:', sessionId);
    }
    
    // ----------------
    // 2. GET CURRENT SESSION STATE
    // ----------------
    let sessionData = await getSessionData(sessionId);
    
    // ----------------
    // 3. HANDLE STEP ADVANCEMENT
    // ----------------
    // If the step was complete and user sends a new message, advance to next step
    if (lastMessage.role === 'user' && sessionData.stepComplete) {
      sessionData = await validateAndAdvanceStep(
        sessionId, 
        () => false // Force advance since we already validated
      );
    }
    
    // ----------------
    // 4. PREPARE STEP-SPECIFIC CONTEXT
    // ----------------
    // Get the appropriate system message and tools
    console.log('[Debug] Current step before getSystemPrompt:', sessionData.currentStep);
    const systemPrompt = getSystemPrompt(sessionData.currentStep as StepNumber, sessionData.taskData);
    const stepTools = getStepTools(sessionData.currentStep as StepNumber);
    
    // ----------------
    // 5. PROCESS TOOL RESULTS
    // ----------------
    console.log('[Debug] Extracting tool results from messages');
    const toolResults = extractToolResults(messages);
    console.log('[Debug] Tool results extracted:', toolResults ? Object.keys(toolResults) : 'null');
    if (toolResults) {
      console.log('[Tool Results] Processing:', JSON.stringify(toolResults));
      
      // Check for special forcing flag
      const forceValidate = !!(toolResults as ToolResult).__forceValidate;
      if (forceValidate) {
        const results = toolResults as ToolResult;
        delete results.__forceValidate;
      }
      
      // ----------------
      // 6. UPDATE SESSION DATA
      // ----------------
      console.log('[Debug] Before update, session data:', JSON.stringify({
        currentStep: sessionData.currentStep, 
        taskData: Object.keys(sessionData.taskData || {})
      }));
      
      await updateSessionData(sessionId, {
        taskData: {
          ...sessionData.taskData,
          ...toolResults
        }
      });
      
      // ----------------
      // 7. VALIDATE AND POTENTIALLY ADVANCE STEP
      // ----------------
      const updatedSession = await validateAndAdvanceStep(
        sessionId, 
        (data) => forceValidate || stepValidators.validate(sessionData.currentStep, data)
      );
      
      // Get updated session data after validation
      sessionData = updatedSession;
      
      console.log(`[Session] Current step: ${sessionData.currentStep}, Complete: ${sessionData.stepComplete}, TaskData keys: ${Object.keys(sessionData.taskData || {})}`);
    }

    // ----------------
    // 8. PREPARE RESPONSE
    // ----------------
    // Generate additional instructions for the model
    const additionalInstructions = generateInstructions(sessionData);
    console.log('[DEBUG] System prompt length:', systemPrompt.length);
    console.log('[DEBUG] Additional instructions length:', additionalInstructions.length);
    console.log('[DEBUG] Current step for tools:', sessionData.currentStep);

    // ----------------
    // 9. GENERATE STREAM RESPONSE
    // ----------------
    console.log('[DEBUG] Creating stream with tools for step:', sessionData.currentStep);
    console.log('[DEBUG] Available tools:', Object.keys(stepTools));
    
    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt + additionalInstructions,
      messages,
      maxSteps: 15,
      experimental_toolCallStreaming: true,
      tools: {
        ...stepTools,
        ...reasoningStepTool
      },
    });
    
    console.log('[DEBUG] Stream created successfully');

    // ----------------
    // 10. SEND RESPONSE WITH SESSION ID
    // ----------------
    const response = result.toDataStreamResponse();
    const headers = new Headers(response.headers);
    headers.set('X-Session-ID', sessionId);
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error: any) {
    console.error('[ERROR] Error in chat route:', error);
    
    // Return a properly formatted error response
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: `Error processing chat request: ${error.message || 'Unknown error'}` 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
