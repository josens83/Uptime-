import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, Lock, Star, ChevronRight, Zap } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import {
  Scenario,
  scenarios,
  getDifficultyColor,
  getDifficultyName,
  generateDailyChallenge,
  generateWeeklyChallenge,
  Challenge
} from '../../data/scenarios';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/helpers';

interface ScenarioSelectProps {
  onSelect: (scenario: Scenario) => void;
  onClose: () => void;
}

type Tab = 'scenarios' | 'challenges';

export function ScenarioSelect({ onSelect, onClose }: ScenarioSelectProps) {
  const [activeTab, setActiveTab] = useState<Tab>('scenarios');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [dailyChallenge] = useState(() => generateDailyChallenge());
  const [weeklyChallenge] = useState(() => generateWeeklyChallenge());

  const { user } = useAuthStore();
  const isPremium = user?.subscription && user.subscription !== 'free';

  const filteredScenarios = selectedDifficulty
    ? scenarios.filter(s => s.difficulty === selectedDifficulty)
    : scenarios;

  const difficulties = ['easy', 'normal', 'hard', 'expert'] as const;

  const handleSelectScenario = (scenario: Scenario) => {
    if (scenario.premium && !isPremium) {
      alert('이 시나리오는 Pro 이상 구독자만 이용할 수 있습니다.');
      return;
    }
    onSelect(scenario);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-100">게임 모드</h2>
            <p className="text-sm text-dark-400">도전 과제를 선택하세요</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-700">
        <button
          onClick={() => setActiveTab('scenarios')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'scenarios'
              ? 'border-primary-500 text-primary-400'
              : 'border-transparent text-dark-400 hover:text-dark-200'
          )}
        >
          시나리오 모드
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'challenges'
              ? 'border-primary-500 text-primary-400'
              : 'border-transparent text-dark-400 hover:text-dark-200'
          )}
        >
          도전 과제
        </button>
      </div>

      {activeTab === 'scenarios' ? (
        <>
          {/* Difficulty Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedDifficulty(null)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm transition-all',
                !selectedDifficulty
                  ? 'bg-dark-700 text-dark-100'
                  : 'text-dark-400 hover:text-dark-200'
              )}
            >
              전체
            </button>
            {difficulties.map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm transition-all',
                  selectedDifficulty === diff
                    ? getDifficultyColor(diff)
                    : 'text-dark-400 hover:text-dark-200'
                )}
              >
                {getDifficultyName(diff)}
              </button>
            ))}
          </div>

          {/* Scenarios Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredScenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    'p-4 cursor-pointer hover:border-dark-600 transition-all',
                    scenario.premium && !isPremium && 'opacity-60'
                  )}
                  onClick={() => handleSelectScenario(scenario)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{scenario.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-dark-100">{scenario.name}</h3>
                          {scenario.premium && (
                            isPremium ? (
                              <Badge variant="premium" size="sm">Pro</Badge>
                            ) : (
                              <Lock className="w-4 h-4 text-dark-500" />
                            )
                          )}
                        </div>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full border',
                          getDifficultyColor(scenario.difficulty)
                        )}>
                          {getDifficultyName(scenario.difficulty)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-dark-400 mb-3">{scenario.description}</p>

                  {/* Objectives Preview */}
                  <div className="space-y-1 mb-3">
                    {scenario.objectives.slice(0, 2).map(obj => (
                      <div key={obj.id} className="flex items-center gap-2 text-xs text-dark-400">
                        <Target className="w-3 h-3" />
                        <span>{obj.description}</span>
                      </div>
                    ))}
                    {scenario.objectives.length > 2 && (
                      <span className="text-xs text-dark-500">
                        +{scenario.objectives.length - 2}개 더...
                      </span>
                    )}
                  </div>

                  {/* Time Limit */}
                  {scenario.timeLimit && (
                    <div className="flex items-center gap-1 text-xs text-dark-400">
                      <Clock className="w-3 h-3" />
                      <span>제한 시간: {scenario.timeLimit}일</span>
                    </div>
                  )}

                  {/* Start Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    disabled={scenario.premium && !isPremium}
                  >
                    시작하기
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        /* Challenges Tab */
        <div className="space-y-4">
          {/* Daily Challenge */}
          <Card className="p-4 border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-100">일일 도전</h3>
                <p className="text-xs text-dark-400">
                  {dailyChallenge.expiresAt && `${Math.ceil((dailyChallenge.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60))}시간 남음`}
                </p>
              </div>
            </div>
            <h4 className="font-medium text-dark-200 mb-1">{dailyChallenge.name}</h4>
            <p className="text-sm text-dark-400 mb-3">{dailyChallenge.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <Trophy className="w-4 h-4" />
                <span>보상: ${dailyChallenge.rewards.money}</span>
              </div>
              <Button variant="warning" size="sm">
                도전하기
              </Button>
            </div>
          </Card>

          {/* Weekly Challenge */}
          <Card className={cn(
            'p-4',
            weeklyChallenge.premium && !isPremium
              ? 'border-dark-700 opacity-60'
              : 'border-purple-500/30 bg-purple-500/5'
          )}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Star className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-dark-100">주간 도전</h3>
                  {weeklyChallenge.premium && (
                    isPremium ? (
                      <Badge variant="premium" size="sm">Pro</Badge>
                    ) : (
                      <Lock className="w-4 h-4 text-dark-500" />
                    )
                  )}
                </div>
                <p className="text-xs text-dark-400">
                  {weeklyChallenge.expiresAt && `${Math.ceil((weeklyChallenge.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}일 남음`}
                </p>
              </div>
            </div>
            <h4 className="font-medium text-dark-200 mb-1">{weeklyChallenge.name}</h4>
            <p className="text-sm text-dark-400 mb-3">{weeklyChallenge.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-purple-400">
                <Trophy className="w-4 h-4" />
                <span>보상: ${weeklyChallenge.rewards.money}</span>
                {weeklyChallenge.rewards.reputation && (
                  <span>+{weeklyChallenge.rewards.reputation} 평판</span>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={weeklyChallenge.premium && !isPremium}
              >
                도전하기
              </Button>
            </div>
          </Card>

          {/* More Challenges Coming */}
          <div className="text-center py-8 text-dark-400">
            <p>더 많은 도전 과제가 준비 중입니다!</p>
          </div>
        </div>
      )}

      {/* Close Button */}
      <Button variant="ghost" fullWidth onClick={onClose}>
        돌아가기
      </Button>
    </div>
  );
}
