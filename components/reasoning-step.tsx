"use client";

import { type ReasoningStep as TReasoningStep } from "@/lib/schema";
import { motion } from "framer-motion";

export const ReasoningStep = ({ step }: { step: any }) => {
  // Handle both the original schema type and plain objects
  const title = step?.title || "Reasoning Step";
  const content = step?.content || step?.text || "No content available";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-50 p-5 rounded-lg flex flex-col w-full justify-between shadow-sm border border-gray-200 dark:border-zinc-700"
    >
      <div className="flex items-center mb-2">
        <div className="bg-blue-500 dark:bg-blue-600 text-white text-[10px] uppercase font-semibold py-1 px-2 rounded-sm">
          Reasoning Step
        </div>
      </div>
      <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{content}</p>
    </motion.div>
  );
};
