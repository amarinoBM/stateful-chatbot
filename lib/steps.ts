import { z } from 'zod';
import { PerformanceTask } from './schema';

// Constants
const STEP_NUMBERS = {
  TASK_IDEAS: 1,
  FOCUS_TOPICS: 2,
  PRODUCT_OPTIONS: 3,
  REQUIREMENTS: 4,
  RUBRIC: 5,
  FINAL_JSON: 6
} as const;

const TOOL_NAMES = {
  REASONING: "addAReasoningStep",
  TASK_IDEAS: "proposeTaskIdeas",
  FOCUS_TOPICS: "provideFocusTopics",
  PRODUCT_OPTIONS: "presentProductOptions",
  REQUIREMENTS: "defineRequirements",
  RUBRIC: "createRubric",
  FINAL_JSON: "generateFinalJSON"
} as const;

// Custom types
export type StepNumber = typeof STEP_NUMBERS[keyof typeof STEP_NUMBERS];
type ToolName = typeof TOOL_NAMES[keyof typeof TOOL_NAMES];
type StepValidator = (data: Partial<PerformanceTask>, dummy?: any) => boolean;
type StepValidators = Record<StepNumber, StepValidator> & {
  validate: (step: number, data: Partial<PerformanceTask>) => boolean;
};

// ===========================
// Step Validation
// ===========================

/**
 * Step validators to determine when to advance to the next step
 */
export const stepValidators: StepValidators = {
  // Step 1: Task Ideas - check if user has selected an idea
  [STEP_NUMBERS.TASK_IDEAS]: (data: Partial<PerformanceTask>): boolean => {
    // Only require the selectedTaskIndex to be defined
    return data.selectedTaskIndex !== undefined;
  },
  
  // Step 2: Focus Topics - check if user has selected focus topics
  [STEP_NUMBERS.FOCUS_TOPICS]: (data: Partial<PerformanceTask>): boolean => {
    // Only require that at least one focus topic is selected
    return !!data.selectedFocusTopics && data.selectedFocusTopics.length > 0;
  },
  
  // Step 3: Product Options - check if user has selected product options
  [STEP_NUMBERS.PRODUCT_OPTIONS]: (data: Partial<PerformanceTask>): boolean => {
    // Allow any number of product options (at least 1)
    return !!data.selectedProductOptions && data.selectedProductOptions.length >= 1;
  },
  
  // Step 4: Requirements - check if requirements are defined
  [STEP_NUMBERS.REQUIREMENTS]: (data: Partial<PerformanceTask>): boolean => {
    // Only require an overview and at least 3 steps
    return !!data.requirements && 
      !!data.requirements.overview && 
      !!data.requirements.steps &&
      data.requirements.steps.length >= 3;
  },
  
  // Step 5: Rubric - check if rubric is defined
  [STEP_NUMBERS.RUBRIC]: (data: Partial<PerformanceTask>): boolean => {
    // Only require a title and at least 2 criteria
    return !!data.rubric && 
      !!data.rubric.title && 
      !!data.rubric.criteria &&
      data.rubric.criteria.length >= 2;
  },
  
  // Step 6: Final JSON - always valid as it's the final step
  [STEP_NUMBERS.FINAL_JSON]: (_data: Partial<PerformanceTask>): boolean => true,
  
  // Generic validation helper
  validate: (step: number, data: Partial<PerformanceTask>): boolean => {
    if (step < 1 || step > 6) return false;
    
    // Cast the step to our step number type
    const stepNumber = step as StepNumber;
    return stepValidators[stepNumber](data);
  }
};

// ===========================
// System Prompts
// ===========================

/**
 * Common instructions for all steps to show reasoning
 */
const reasoningInstructions = `
IMPORTANT: Follow this EXACT sequence:

1. First, use addAReasoningStep to analyze what you need to do in this step
2. Then, use addAReasoningStep to explain your approach 
3. IMMEDIATELY AFTER your reasoning steps, you MUST use the specified tool below - this is REQUIRED
4. DO NOT provide any direct text response after your reasoning steps - ONLY use the appropriate tool

DO NOT skip step 3. You MUST call the appropriate tool after your reasoning steps.
`;

/**
 * Get system message for current step
 */
export function getSystemPrompt(step: StepNumber, data: Partial<PerformanceTask>): string {
  switch(step) {
    case STEP_NUMBERS.TASK_IDEAS:
      return `You are a curriculum design assistant helping educators create performance tasks for neurodiverse learners.
${reasoningInstructions}
In this step (Step 1 of 6: Task Ideas), propose three distinct GRASPS-aligned task ideas. GRASPS stands for:
- Goal: The challenge or problem to solve
- Role: The student's role in the scenario
- Audience: Who the work is being created for
- Situation: The context/scenario
- Product: What will be created
- Standards: Success criteria

Each idea should have a title and a brief 2-3 sentence description that introduces the task in an engaging way. Make the ideas diverse in subject matter and approach.

AFTER your reasoning steps, you MUST call the proposeTaskIdeas tool to generate three task ideas.
YOU MUST CALL proposeTaskIdeas - it is REQUIRED. Always include 3 complete task ideas with titles and descriptions.

IMPORTANT: Only mark a task as selected when the user explicitly makes a choice like "I like the first one" or "Let's go with idea 2". 
Do not mark any task as selected unless the user has made an explicit choice.
When a user does select a task, call proposeTaskIdeas again with both the ideas and the selectedTaskIndex parameter.`;
    
    case STEP_NUMBERS.FOCUS_TOPICS:
      const selectedTask = data.taskIdeas?.[data.selectedTaskIndex as number];
      return `You are a curriculum design assistant helping educators create performance tasks for neurodiverse learners.
${reasoningInstructions}
Now that the educator has selected a task idea, in this step (Step 2 of 6: Focus Topics), you will provide 8-10 diverse focus topics that students could choose to explore within this task. 

The selected task is: "${selectedTask?.title}"
Description: "${selectedTask?.description}"

Each focus topic should:
- Be concise (1 sentence)
- Be specific enough to guide research
- Allow for multiple perspectives or approaches
- Be accessible to students with diverse learning needs
- Relate clearly to the selected task

IMPORTANT: After showing your reasoning, ONLY use the provideFocusTopics tool to generate the focus topics. DO NOT type the topics directly in your response.

After the user selects one or more topics, include their selections in the selectedFocusTopics parameter of the provideFocusTopics tool. Do not use a separate call.`;
    
    case STEP_NUMBERS.PRODUCT_OPTIONS:
      return `You are a curriculum design assistant helping educators create performance tasks for neurodiverse learners.
${reasoningInstructions}
Based on the selected task and focus topics, in this step (Step 3 of 6: Product Options), provide 5-10 potential final product options that students could create to demonstrate their learning.

The selected task is: "${data.taskIdeas?.[data.selectedTaskIndex as number]?.title}"
The educator is interested in these focus topics: "${data.selectedFocusTopics?.join(', ')}"

The product options should:
- Vary in modality (written, visual, audio, digital, physical)
- Accommodate different learning styles and strengths
- Be specific enough to guide creation
- Connect clearly to the task and focus topics
- Be accessible to neurodiverse learners

IMPORTANT: After showing your reasoning, ONLY use the presentProductOptions tool to generate the product options. DO NOT type the options directly in your response.

After the user selects 1-4 product options, include their selections in the selectedProductOptions parameter of the presentProductOptions tool. Do not use a separate call.`;
    
    case STEP_NUMBERS.REQUIREMENTS:
      return `You are a curriculum design assistant helping educators create performance tasks for neurodiverse learners.
${reasoningInstructions}
In this step (Step 4 of 6: Requirements), create detailed, accessible student-facing requirements for the performance task. These should explain what students need to do to complete the task successfully.

The selected task is: "${data.taskIdeas?.[data.selectedTaskIndex as number]?.title}"
Focus topics: "${data.selectedFocusTopics?.join(', ')}"
Product options: "${data.selectedProductOptions?.join(', ')}"

The requirements should include:
1. An overview paragraph that introduces the task, its purpose, and the big picture
2. A list of 4-8 specific, sequential steps students will take to complete the task
3. Clear, concise language appropriate for neurodiverse learners
4. Specific details about what must be included in their final product

IMPORTANT: After showing your reasoning, ONLY use the defineRequirements tool to provide the requirements. DO NOT type the requirements directly in your response.

Wait for the user to approve or request changes to these requirements before proceeding.`;
    
    case STEP_NUMBERS.RUBRIC:
      return `You are a curriculum design assistant helping educators create performance tasks for neurodiverse learners.
${reasoningInstructions}
In this step (Step 5 of 6: Rubric), create a student-facing rubric that clearly defines what success looks like at different levels of performance. This rubric should help students understand how their work will be evaluated.

The selected task is: "${data.taskIdeas?.[data.selectedTaskIndex as number]?.title}"
Focus topics: "${data.selectedFocusTopics?.join(', ')}"
Product options: "${data.selectedProductOptions?.join(', ')}"
Requirements overview: "${data.requirements?.overview}"

The rubric should include:
1. A clear title and brief description explaining how the rubric works
2. 2-4 specific skill areas being assessed (e.g., research, analysis, communication)
3. For each skill area, provide specific descriptions for 4 performance levels:
   - Try: Beginning attempts at the skill
   - Relevant: Shows understanding but needs development
   - Accurate: Demonstrates competence
   - Complex: Shows sophisticated mastery

Use language that is clear, specific, and actionable for neurodiverse learners.

IMPORTANT: After showing your reasoning, ONLY use the createRubric tool to generate the rubric. DO NOT type the rubric directly in your response.

Wait for the user to approve or request changes to this rubric before proceeding.`;
    
    case STEP_NUMBERS.FINAL_JSON:
      return `You are a curriculum design assistant helping educators create performance tasks for neurodiverse learners.
${reasoningInstructions}
In this final step (Step 6 of 6: Final Output), generate a structured JSON output that includes all components of the performance task.

The selected task: "${data.taskIdeas?.[data.selectedTaskIndex as number]?.title}"
Description: "${data.taskIdeas?.[data.selectedTaskIndex as number]?.description}"
Focus topics: "${data.selectedFocusTopics?.join(', ')}"
Product options: "${data.selectedProductOptions?.join(', ')}"
Requirements overview: "${data.requirements?.overview}"
Requirement steps: "${data.requirements?.steps?.join('\n')}"
Rubric title: "${data.rubric?.title}"
Rubric description: "${data.rubric?.description}"

This JSON will be the complete record of the performance task that can be saved and shared with others.

IMPORTANT: After showing your reasoning, ONLY use the generateFinalJSON tool to create the final formatted output. DO NOT type the JSON directly in your response.

Congratulate the user on completing their performance task.`;
    
    default:
      return "I'm here to help you create a performance task for neurodiverse learners. Please tell me what subject you'd like to focus on to get started.";
  }
}

// ===========================
// Tool Definitions
// ===========================

/**
 * Get tools for current step
 */
export function getStepTools(step: StepNumber) {
  // Step-specific tools
  const stepSpecificTools: Record<StepNumber, Record<string, any>> = {
    [STEP_NUMBERS.TASK_IDEAS]: {
      [TOOL_NAMES.TASK_IDEAS]: {
        description: "Propose three task ideas or choose one from previously proposed ideas.",
        parameters: z.object({
          subjects: z.array(z.string()).optional(),
          ideas: z.array(z.object({
            title: z.string(),
            description: z.string()
          })).optional(),
          selectedTaskIndex: z.number().optional()
        }),
        execute: async ({ subjects = [], ideas = [], selectedTaskIndex }: { 
          subjects?: string[], 
          ideas?: Array<{ title: string, description: string }>, 
          selectedTaskIndex?: number 
        }) => {
          console.log('[DEBUG] proposeTaskIdeas execute function called with subjects:', subjects);
          
          try {
            // For validation
            const ensureValidIdeas = (ideas: any[] = []) => {
              // Check if we have valid ideas
              const validIdeas = Array.isArray(ideas) 
                ? ideas.filter(idea => 
                    idea && 
                    typeof idea === 'object' && 
                    typeof idea.title === 'string' && 
                    typeof idea.description === 'string')
                : [];
              
              if (validIdeas.length > 0) {
                console.log('[DEBUG] Found valid ideas, count:', validIdeas.length);
                return validIdeas;
              }
              
              // Create sample ideas based on subjects
              console.log('[DEBUG] Creating sample task ideas for subjects:', subjects);
              
              const subjectStr = subjects.length > 0 
                ? subjects.join(' and ') 
                : 'English and Social Studies';
                
              // Generate default ideas with subject-specific content
              return [
                {
                  title: `${subjectStr} Research Project`,
                  description: `Students will research a topic related to ${subjectStr} and present their findings through a multimedia presentation, emphasizing critical analysis and communication skills.`
                },
                {
                  title: `${subjectStr} Creative Portfolio`,
                  description: `Students will create a portfolio that demonstrates their understanding of key concepts in ${subjectStr} through a collection of creative works, reflections, and analytical pieces.`
                },
                {
                  title: `${subjectStr} Community Impact Project`,
                  description: `Students will identify a real-world problem related to ${subjectStr}, develop a solution proposal, and implement a small-scale version in their community with documentation of process and impact.`
                }
              ];
            };
            
            // Handle selection of an existing idea
            if (selectedTaskIndex !== undefined) {
              const validIdeas = ensureValidIdeas(ideas);
              const index = parseInt(String(selectedTaskIndex));
              
              if (isNaN(index) || index < 0 || index >= validIdeas.length) {
                console.error('[ERROR] Invalid selectedTaskIndex:', selectedTaskIndex);
                // Return valid ideas without selection
                return { ideas: validIdeas };
              }
              
              console.log('[DEBUG] Selected task at index:', index);
              return { ideas: validIdeas, selectedTaskIndex: index };
            }
            
            // Generate new ideas
            return { ideas: ensureValidIdeas(ideas) };
            
          } catch (error) {
            console.error('[ERROR] Error in proposeTaskIdeas:', error);
            
            // Always return valid data even in error case
            const subjectStr = subjects.length > 0 
              ? subjects.join(' and ') 
              : 'English and Social Studies';
            
            return {
              ideas: [
                {
                  title: `${subjectStr} Research Project`,
                  description: `Students will research a topic related to ${subjectStr} and present their findings through a multimedia presentation, emphasizing critical analysis and communication skills.`
                },
                {
                  title: `${subjectStr} Creative Portfolio`,
                  description: `Students will create a portfolio that demonstrates their understanding of key concepts in ${subjectStr} through a collection of creative works, reflections, and analytical pieces.`
                },
                {
                  title: `${subjectStr} Community Impact Project`,
                  description: `Students will identify a real-world problem related to ${subjectStr}, develop a solution proposal, and implement a small-scale version in their community with documentation of process and impact.`
                }
              ]
            };
          }
        }
      }
    },
    [STEP_NUMBERS.FOCUS_TOPICS]: {
      [TOOL_NAMES.FOCUS_TOPICS]: {
        description: "Provide focus topic options based on the selected task and handle selection.",
        parameters: z.object({
          topics: z.array(z.string()).min(5).max(10).describe("List of 5-10 diverse focus topics"),
          selectedFocusTopics: z.array(z.string()).optional().describe("Array of selected focus topics")
        }),
        execute: async (params: { 
          topics: string[],
          selectedFocusTopics?: string[]
        }) => {
          // Return both topics and selection if provided
          if (params.selectedFocusTopics?.length) {
            return { 
              focusTopics: params.topics,
              selectedFocusTopics: params.selectedFocusTopics,
              __forceValidate: true
            };
          }
          return { focusTopics: params.topics };
        },
      }
    },
    [STEP_NUMBERS.PRODUCT_OPTIONS]: {
      [TOOL_NAMES.PRODUCT_OPTIONS]: {
        description: "Present final product options and handle selection.",
        parameters: z.object({
          options: z.array(z.string()).min(5).max(10).describe("List of 5-10 potential final product options"),
          selectedProductOptions: z.array(z.string()).min(1).max(5).optional().describe("Array of 1-5 selected product options")
        }),
        execute: async (params: { 
          options: string[],
          selectedProductOptions?: string[]
        }) => {
          // Return both options and selection if provided
          if (params.selectedProductOptions?.length) {
            return { 
              productOptions: params.options,
              selectedProductOptions: params.selectedProductOptions,
              __forceValidate: true
            };
          }
          return { productOptions: params.options };
        },
      }
    },
    [STEP_NUMBERS.REQUIREMENTS]: {
      [TOOL_NAMES.REQUIREMENTS]: {
        description: "Define student-facing requirements.",
        parameters: z.object({
          overview: z.string().describe("Overview of the requirements"),
          steps: z.array(z.string()).min(3).max(10).describe("3-10 bullet-point steps")
        }),
        execute: async (params: { overview: string, steps: string[] }) => params,
      }
    },
    [STEP_NUMBERS.RUBRIC]: {
      [TOOL_NAMES.RUBRIC]: {
        description: "Create a student-facing rubric.",
        parameters: z.object({
          title: z.string().describe("Rubric title"),
          description: z.string().describe("Rubric description").optional(),
          criteria: z.array(z.object({
            skill: z.string().describe("Specific skill being assessed"),
            levels: z.object({
              try: z.string().describe("Try level description"),
              relevant: z.string().describe("Relevant level description"),
              accurate: z.string().describe("Accurate level description"),
              complex: z.string().describe("Complex level description")
            })
          })).min(2).describe("Rubric criteria with performance levels")
        }),
        execute: async (params: { 
          title: string, 
          description?: string, 
          criteria: Array<{ 
            skill: string, 
            levels: { 
              try: string, 
              relevant: string, 
              accurate: string, 
              complex: string 
            } 
          }> 
        }) => params,
      }
    },
    [STEP_NUMBERS.FINAL_JSON]: {
      [TOOL_NAMES.FINAL_JSON]: {
        description: "Generate the final JSON output.",
        parameters: z.object({
          finalOutput: z.string().describe("The final formatted JSON output")
        }),
        execute: async (params: { finalOutput: string }) => params,
      }
    }
  };
  
  return stepSpecificTools[step] || {};
} 