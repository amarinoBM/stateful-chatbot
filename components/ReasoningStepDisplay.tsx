type ReasoningStepProps = {
  step: {
    title: string;
    content: string;
  };
};

export function ReasoningStepDisplay({ step }: ReasoningStepProps) {
  const { title, content } = step;
  
  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-sm">
      <div className="flex flex-row">
        <div className="inline-block bg-blue-500 text-white text-xs py-1 px-2 rounded">
          REASONING STEP
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
          {title}
        </h3>
        <div className="text-zinc-600 dark:text-zinc-300 mt-1">
          {content}
        </div>
      </div>
    </div>
  );
} 