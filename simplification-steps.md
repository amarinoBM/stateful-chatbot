# Performance Task Builder Simplification Plan

## 1. Retain Reasoning Steps
- Keep the visual reasoning steps in the UI
- Maintain the `addAReasoningStep` tool functionality
- Ensure reasoning steps continue to provide transparency into AI decision-making

## 2. Streamline Session Management ✅
- Remove all localStorage session storage code from page.tsx ✅
- Keep server-side session management using Vercel KV ✅
- Update page.tsx to rely exclusively on session ID from API response headers ✅
- Remove session-related localStorage in useEffect and startNewConversation functions ✅

## 3. Split Message Component ✅
- Break down Message.tsx into smaller components:
  - `UserMessage.tsx` - For rendering user messages ✅
  - `AssistantMessage.tsx` - For rendering assistant text responses ✅
  - `ReasoningStepDisplay.tsx` - Extract existing component to its own file ✅
  - `ToolResultDisplay.tsx` - For rendering different tool results ✅
  - Use composition in the main Message component ✅

## 4. Remove Loop Detection ✅
- Remove the entire detectLoop function from route.ts ✅
- Remove loop detection logic from the POST handler ✅
- Simplify the message processing flow ✅

## 5. Simplify Tool Selection Handling ✅
- Modify step tools to handle selections directly ✅
- Update proposeTaskIdeas to accept selection parameter ✅
- Update provideFocusTopics to accept selection parameter ✅
- Update presentProductOptions to accept selection parameter ✅
- Remove the standalone storeSelection tool ✅

## 6. Keep Suggestion Logic ✅
- Retain the existing SuggestedActions component ✅
- Keep the contextual suggestion logic ✅
- Maintain the existing suggestion sets and UI ✅

## 7. Simplify Validation Logic ✅
- Relax validation requirements in stepValidators object ✅
- Reduce minimum requirements for each step ✅
- Make validation more forgiving of partial completions ✅
- Keep the basic step structure but with less rigid validation ✅

## 8. Reduce Code Complexity in route.ts ✅
- Extract tool result processing into separate functions ✅
- Create dedicated functions for each step's processing ✅
- Move system prompt construction to a separate function ✅
- Simplify the main POST handler to be more readable ✅
- Break down the large route.ts file into logical sections ✅

## Implementation Order
1. Split Message component into smaller components ✅
2. Simplify tool selection handling ✅
3. Remove localStorage session management ✅
4. Remove loop detection logic ✅
5. Simplify validation requirements ✅
6. Refactor route.ts to reduce complexity ✅

## Files to Modify
- page.tsx ✅
- message.tsx (plus new component files) ✅
- steps.ts ✅
- route.ts ✅
- session.ts (minimal changes) ✅

No changes needed to:
- suggested-actions.tsx
- markdown.tsx

## Expected Outcomes
- Cleaner, more maintainable codebase ✅
- Simpler session management ✅
- More focused component responsibilities ✅
- Smoother conversation flow with looser validation ✅
- Reduced complexity in API handling ✅
- Preserved core functionality and UX ✅
