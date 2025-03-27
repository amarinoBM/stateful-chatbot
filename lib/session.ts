import { kv as vercelKv } from '@vercel/kv';
import { mockKv } from './mock-kv';
import { PerformanceTask } from './schema';

// Use mock KV if Vercel KV is not configured or has placeholder values
const isRealKvConfigured = 
  process.env.KV_URL && 
  process.env.KV_URL !== 'your_kv_url_here' &&
  process.env.KV_REST_API_URL && 
  process.env.KV_REST_API_URL !== 'your_kv_rest_api_url_here';

// Use mock KV by default in development
const kv = isRealKvConfigured ? vercelKv : mockKv;

// Define the session data structure
export type SessionData = {
  currentStep: number;     // Which step the user is currently on
  stepComplete: boolean;   // Whether the current step has been completed
  taskData: Partial<PerformanceTask>; // Data collected so far
};

// Retrieve session data
export async function getSessionData(sessionId: string): Promise<SessionData> {
  const data = await kv.get<SessionData>(`session:${sessionId}`);
  console.log(`[Session] Getting data for session ${sessionId}`, data);
  
  return data || {
    currentStep: 1,
    stepComplete: false,
    taskData: {}
  };
}

// Update session data
export async function updateSessionData(
  sessionId: string, 
  data: Partial<SessionData>
): Promise<void> {
  const currentData = await getSessionData(sessionId);
  
  const updatedData = {
    ...currentData,
    ...data
  };
  
  console.log(`[Session] Updating session ${sessionId}`, updatedData);
  await kv.set(`session:${sessionId}`, updatedData);
}

// Check if step is complete and handle step advancement
export async function validateAndAdvanceStep(
  sessionId: string, 
  stepValidator: (data: Partial<PerformanceTask>, dummy?: any) => boolean
): Promise<SessionData> {
  const sessionData = await getSessionData(sessionId);
  
  // If we already validated this step previously and found it complete,
  // we can skip re-validation to avoid repeated processing
  if (sessionData.stepComplete) {
    console.log(`[Session] Step ${sessionData.currentStep} already complete, advancing to next step`);
    await updateSessionData(sessionId, {
      currentStep: sessionData.currentStep + 1,
      stepComplete: false
    });
    return getSessionData(sessionId);
  }
  
  // Check if current step data is valid
  const isStepComplete = stepValidator(sessionData.taskData, null);
  
  console.log(`[Session] Validating step ${sessionData.currentStep}:`, isStepComplete);
  
  // If step is complete, mark it as complete
  if (isStepComplete) {
    console.log(`[Session] Marking step ${sessionData.currentStep} as complete`);
    await updateSessionData(sessionId, {
      stepComplete: true
    });
  }
  
  return getSessionData(sessionId);
} 