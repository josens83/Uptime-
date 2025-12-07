import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Activity,
  Ticket,
  DollarSign,
  Users,
  Zap,
  Target,
  Award,
  Rocket
} from 'lucide-react';
import { Button, Card } from '../ui';
import { cn } from '../../utils/helpers';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string; // CSS selector for highlighting
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  tip?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'UPTIME에 오신 것을 환영합니다!',
    description: '웹사이트 운영 시뮬레이션 게임입니다. 서비스를 성장시키고 업타임을 유지하세요!',
    icon: <Rocket className="w-8 h-8 text-primary-400" />,
    position: 'center'
  },
  {
    id: 'uptime',
    title: '업타임 게이지',
    description: '가장 중요한 지표입니다! 업타임이 0%가 되면 게임 오버입니다. 티켓을 해결하고 서버를 관리해서 업타임을 유지하세요.',
    icon: <Activity className="w-8 h-8 text-success-400" />,
    highlight: '[data-tutorial="uptime"]',
    position: 'bottom',
    tip: '업타임 95% 이상을 유지하면 보너스 수익을 얻습니다!'
  },
  {
    id: 'tickets',
    title: '이슈 티켓',
    description: '실시간으로 발생하는 이슈들입니다. 시간 내에 해결하지 않으면 업타임과 평판이 하락합니다.',
    icon: <Ticket className="w-8 h-8 text-warning-400" />,
    highlight: '[data-tutorial="tickets"]',
    position: 'left',
    tip: '빨간색 티켓(Critical)은 우선적으로 처리하세요!'
  },
  {
    id: 'resources',
    title: '리소스 관리',
    description: '돈, 사용자, 평판을 관리하세요. 균형 잡힌 성장이 중요합니다.',
    icon: <DollarSign className="w-8 h-8 text-yellow-400" />,
    highlight: '[data-tutorial="resources"]',
    position: 'bottom',
    tip: '수익은 사용자 수와 평판에 비례합니다.'
  },
  {
    id: 'team',
    title: '팀 구성',
    description: '개발자, 디자이너, 마케터를 고용하세요. 각 직군은 다른 효과를 제공합니다.',
    icon: <Users className="w-8 h-8 text-blue-400" />,
    highlight: '[data-tutorial="team"]',
    position: 'right',
    tip: '개발자는 티켓 해결, 마케터는 사용자 증가에 효과적입니다.'
  },
  {
    id: 'upgrades',
    title: '업그레이드',
    description: '서버, 기술, 마케팅 업그레이드로 서비스를 강화하세요.',
    icon: <Zap className="w-8 h-8 text-purple-400" />,
    highlight: '[data-tutorial="upgrades"]',
    position: 'left',
    tip: '초반에는 서버 업그레이드가 가장 효과적입니다.'
  },
  {
    id: 'phases',
    title: '성장 단계',
    description: 'Web → Mobile → App으로 성장하세요. 각 단계마다 새로운 도전이 기다립니다!',
    icon: <Target className="w-8 h-8 text-cyan-400" />,
    highlight: '[data-tutorial="phase"]',
    position: 'bottom',
    tip: '다음 단계로 진행하려면 특정 조건을 충족해야 합니다.'
  },
  {
    id: 'events',
    title: '랜덤 이벤트',
    description: '다양한 이벤트가 발생합니다. 선택에 따라 결과가 달라지니 신중하게 결정하세요!',
    icon: <Zap className="w-8 h-8 text-orange-400" />,
    position: 'center',
    tip: 'Pro 구독자는 추가 선택지를 이용할 수 있습니다.'
  },
  {
    id: 'complete',
    title: '준비 완료!',
    description: '이제 게임을 시작할 준비가 되었습니다. 최고의 업타임을 유지하며 서비스를 성장시켜보세요!',
    icon: <Award className="w-8 h-8 text-yellow-400" />,
    position: 'center'
  }
];

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function Tutorial({ onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  useEffect(() => {
    // Highlight element if specified
    if (step.highlight) {
      const element = document.querySelector(step.highlight);
      if (element) {
        element.classList.add('tutorial-highlight');
        return () => {
          element.classList.remove('tutorial-highlight');
        };
      }
    }
  }, [step]);

  const handleNext = () => {
    if (isLastStep) {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={handleSkip}
          />

          {/* Tutorial Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              'fixed z-50 w-full max-w-md',
              step.position === 'center' && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              step.position === 'top' && 'top-24 left-1/2 -translate-x-1/2',
              step.position === 'bottom' && 'bottom-24 left-1/2 -translate-x-1/2',
              step.position === 'left' && 'top-1/2 left-8 -translate-y-1/2',
              step.position === 'right' && 'top-1/2 right-8 -translate-y-1/2',
              !step.position && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            )}
          >
            <Card className="p-6 border-primary-500/50 bg-dark-900/95 backdrop-blur">
              {/* Skip Button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 text-dark-400 hover:text-dark-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-dark-700 rounded-t-lg overflow-hidden">
                <motion.div
                  className="h-full bg-primary-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Step Counter */}
              <div className="text-xs text-dark-500 mb-4">
                {currentStep + 1} / {tutorialSteps.length}
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-xl bg-dark-800">
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-dark-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-dark-300">
                  {step.description}
                </p>

                {/* Tip */}
                {step.tip && (
                  <div className="mt-4 p-3 rounded-lg bg-primary-900/20 border border-primary-500/30">
                    <p className="text-sm text-primary-300">
                      💡 {step.tip}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={isFirstStep}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  이전
                </Button>

                <Button
                  variant="primary"
                  onClick={handleNext}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  {isLastStep ? '시작하기' : '다음'}
                </Button>
              </div>

              {/* Skip Link */}
              <button
                onClick={handleSkip}
                className="w-full mt-4 text-center text-sm text-dark-500 hover:text-dark-300 transition-colors"
              >
                튜토리얼 건너뛰기
              </button>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Tutorial highlight CSS (add to index.css)
export const tutorialHighlightStyles = `
.tutorial-highlight {
  position: relative;
  z-index: 51;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.5), 0 0 20px rgba(14, 165, 233, 0.3);
  border-radius: 8px;
  animation: tutorial-pulse 2s infinite;
}

@keyframes tutorial-pulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.5), 0 0 20px rgba(14, 165, 233, 0.3);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(14, 165, 233, 0.3), 0 0 30px rgba(14, 165, 233, 0.2);
  }
}
`;
