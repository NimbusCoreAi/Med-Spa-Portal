'use client';

import React, { useState } from 'react';
import { Button } from '@baseplate/ui/button';

export interface SetupStep {
  id: string;
  title: string;
  description?: string;
}

export interface AdminSetupProps {
  steps: SetupStep[];
  onComplete: () => void;
  children: (step: SetupStep, stepIndex: number) => React.ReactNode;
}

/**
 * Multi-step setup wizard for new clinic or business accounts. Renders a
 * progress indicator, delegates step content via a render-prop, and calls
 * onComplete once the final step's Next button is clicked.
 */
export function AdminSetup({ steps, onComplete, children }: AdminSetupProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  function handleNext() {
    if (isLast) {
      onComplete();
      return;
    }
    setCurrentStep((prev) => prev + 1);
  }

  function handleBack() {
    if (isFirst) return;
    setCurrentStep((prev) => prev - 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-8 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded border border-gray-300 p-4">
        <h2 className="text-lg font-semibold text-gray-900">{step.title}</h2>
        {step.description && <p className="text-sm text-gray-700">{step.description}</p>}
        <div className="mt-4">{children(step, currentStep)}</div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Step {currentStep + 1} of {steps.length}
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleBack} disabled={isFirst}>
            Back
          </Button>
          <Button onClick={handleNext}>{isLast ? 'Complete' : 'Next'}</Button>
        </div>
      </div>
    </div>
  );
}
