interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
  }
  
  export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const progress = (currentStep / totalSteps) * 100;
  
    return (
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-in-out"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(to right, #ff6b2b, #d22dfc)`,
          }}
        />
      </div>
    );
  }
  
  