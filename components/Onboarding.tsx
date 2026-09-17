'use client';
import React, { useState, useEffect } from 'react';
import { LockIcon, ZapIcon, TrendingUpIcon } from './icons';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'Lock NIM, Borrow Anything',
    description: 'Use your NIM as collateral to safely borrow items from people around you.',
    icon: LockIcon,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
  {
    title: 'Earn NIM, Complete Bounties',
    description: 'Verify your location or complete tasks to unlock NIM bounties in the real world.',
    icon: ZapIcon,
    color: 'text-amber-300',
    bg: 'bg-amber-300/10',
  },
  {
    title: 'Build Trust, Pay Less',
    description: 'A higher Trust Score lowers your collateral requirements over time.',
    icon: TrendingUpIcon,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('acta.onboarded', 'true');
    } catch (e) {
      // ignore
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center p-6">
      <button 
        onClick={handleComplete}
        className="absolute top-6 right-6 text-sm font-medium text-slate-400 hover:text-slate-200"
      >
        Skip
      </button>

      <div className="flex-1 flex items-center justify-center w-full max-w-sm">
        <div className="relative w-full h-[400px] overflow-hidden">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const Icon = step.icon;
            
            return (
              <div
                key={idx}
                className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-500 ease-in-out ${
                  isActive ? 'opacity-100 translate-x-0' : 
                  idx < currentStep ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
                }`}
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${step.bg}`}>
                  <Icon size={48} className={step.color} />
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-4">{step.title}</h2>
                <p className="text-slate-400 text-lg">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center pb-8 gap-8">
        <div className="flex gap-2">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-8 bg-amber-300' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-4 bg-amber-300 hover:bg-amber-400 text-slate-900 rounded-xl font-bold text-lg transition-colors"
        >
          {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
