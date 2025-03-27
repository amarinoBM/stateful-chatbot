import { z } from "zod";

export const reasoningStepSchema = z.object({
  title: z.string().describe("The title of the reasoning step"),
  content: z.string().describe("The content of the reasoning step."),
  nextStep: z
    .enum(["continue", "finalAnswer"])
    .describe(
      "Whether to continue with another step or provide the final answer",
    ),
});

export type ReasoningStep = z.infer<typeof reasoningStepSchema>;

export const performanceTaskSchema = z.object({
  title: z.string().describe("Task title"),
  subtitle: z.string().describe("Task subtitle"),
  description: z.string().describe("Task description"),
  purpose: z.string().describe("Task purpose"),
  
  taskIdeas: z.array(z.object({
    title: z.string(),
    description: z.string()
  })).optional(),
  selectedTaskIndex: z.number().optional(),
  
  focusTopics: z.array(z.string()).optional(),
  selectedFocusTopics: z.array(z.string()).optional(),
  
  productOptions: z.array(z.string()).optional(),
  selectedProductOptions: z.array(z.string()).min(1).max(4).optional(),
  
  requirements: z.object({
    overview: z.string(),
    steps: z.array(z.string()).min(8).max(10)
  }).optional(),
  
  rubric: z.object({
    title: z.string(),
    description: z.string(),
    criteria: z.array(z.object({
      skill: z.string(),
      levels: z.object({
        try: z.string(),
        relevant: z.string(),
        accurate: z.string(),
        complex: z.string()
      })
    }))
  }).optional(),
});

export type PerformanceTask = z.infer<typeof performanceTaskSchema>;
