# Test Script: Performance Task Builder Conversation Flow

This document outlines a test script for validating the performance task builder's step-by-step conversation flow.

## Test Setup

1. Start the development server: `npm run dev`
2. Open the chat interface in a browser
3. Monitor the server logs for KV operations
4. Have Firefox Dev Tools or Chrome DevTools open to monitor network requests

## Test Cases

### Test Case 1: Basic Conversation Flow

#### Step 1: Task Ideas
1. **User**: "I want to create a performance task"
2. **Expected**: AI should use `proposeTaskIdeas` tool to present 3 task ideas
3. **User**: "I like the first idea"
4. **Expected**: AI should use `storeSelection` tool to save the selection and mark step as complete
5. **Action**: Verify in server logs that session data was updated with task selection

#### Step 2: Focus Topics
1. **Expected**: After user's response to step 1, AI should automatically advance to step 2
2. **Expected**: AI should use `provideFocusTopics` tool to present 10 focus topics
3. **User**: "I'll use topics 1, 3, and 5"
4. **Expected**: AI should use `storeSelection` tool to save selected topics
5. **Action**: Verify session data contains selected focus topics

#### Step 3: Product Options
1. **Expected**: AI should use `presentProductOptions` tool to show 10 product options
2. **User**: "Let's go with options 2 and 4"
3. **Expected**: AI should store the product option selections
4. **Action**: Verify session data contains product options

#### Step 4: Requirements
1. **Expected**: AI should use `defineRequirements` tool to define task requirements
2. **User**: "These requirements look good"
3. **Expected**: AI should mark step 4 as complete
4. **Action**: Verify requirements are stored in session data

#### Step 5: Rubric
1. **Expected**: AI should use `createRubric` tool to generate a rubric
2. **User**: "The rubric looks great"
3. **Expected**: AI should mark step 5 as complete
4. **Action**: Verify rubric data in session

#### Step 6: Final JSON
1. **Expected**: AI should use `generateFinalJSON` tool to create final output
2. **User**: "Thank you for creating this performance task"
3. **Expected**: Flow should be complete with full task details
4. **Action**: Verify complete task JSON in session data

### Test Case 2: Going Back to Previous Steps

1. Complete steps 1-3 following Test Case 1
2. **User**: "Actually, I want to reconsider the focus topics"
3. **Expected**: AI should allow user to select new focus topics
4. **Action**: Verify session data updates with new selections
5. **User**: "Now let's continue with the requirements"
6. **Expected**: AI should proceed to step 4
7. **Action**: Verify normal flow resumes

### Test Case 3: Session Persistence

1. Complete steps 1-2 following Test Case 1
2. Close and reopen the browser
3. **Expected**: Session should restore to step 3
4. **Action**: Verify session data contains previously selected task and focus topics
5. Complete the remaining steps
6. **Action**: Verify full flow completes successfully

## Test Results Log

### Test Date: [Date]

#### Test Case 1: Basic Conversation Flow
- Step 1: [Pass/Fail] - Notes: 
- Step 2: [Pass/Fail] - Notes:
- Step 3: [Pass/Fail] - Notes:
- Step 4: [Pass/Fail] - Notes:
- Step 5: [Pass/Fail] - Notes:
- Step 6: [Pass/Fail] - Notes:

#### Test Case 2: Going Back to Previous Steps
- [Pass/Fail] - Notes:

#### Test Case 3: Session Persistence
- [Pass/Fail] - Notes:

## Issues Discovered

1. [Issue description]
   - Severity: [High/Medium/Low]
   - Steps to reproduce: 
   - Expected behavior:
   - Actual behavior:

## Overall Assessment

[Summary of test results and next steps] 