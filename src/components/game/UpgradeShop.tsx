import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Users,
  Megaphone,
  Settings,
  Check,
  Lock,
  ChevronUp,
  Zap
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Card, CardHeader, Button, Badge, Modal } from '../ui';
import { cn, formatMoney } from '../../utils/helpers';
import {
  upgrades,
  getAvailableUpgrades,
  getCategoryIcon,
  getCategoryName,
  Upgrade
} from '../../data/upgrades';

type Category = 'all' | 'infrastructure' | 'team' | 'marketing' | 'technology';

export function UpgradeShop() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [showServerUpgrade, setShowServerUpgrade] = useState(false);

  const money = useGameStore(state => state.money);
  const serverTier = useGameStore(state => state.serverTier);
  const purchasedUpgrades = useGameStore(state => state.purchasedUpgrades);
  const purchaseUpgrade = useGameStore(state => state.purchaseUpgrade);
  const upgradeServer = useGameStore(state => state.upgradeServer);
  const getServerCapacity = useGameStore(state => state.getServerCapacity);

  const availableUpgrades = getAvailableUpgrades(purchasedUpgrades);

  const filteredUpgrades = selectedCategory === 'all'
    ? availableUpgrades
    : availableUpgrades.filter(u => u.category === selectedCategory);

  const categories: { id: Category; name: string; icon: React.ReactNode }[] = [
    { id: 'all', name: '전체', icon: <Zap className="w-4 h-4" /> },
    { id: 'infrastructure', name: '인프라', icon: <Server className="w-4 h-4" /> },
    { id: 'team', name: '팀', icon: <Users className="w-4 h-4" /> },
    { id: 'marketing', name: '마케팅', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'technology', name: '기술', icon: <Settings className="w-4 h-4" /> }
  ];

  const serverTiers = [
    { tier: 1, name: 'Basic', capacity: 500, cost: 0 },
    { tier: 2, name: 'Standard', capacity: 2000, cost: 1000 },
    { tier: 3, name: 'Professional', capacity: 5000, cost: 2000 },
    { tier: 4, name: 'Business', capacity: 15000, cost: 4000 },
    { tier: 5, name: 'Enterprise', capacity: 50000, cost: 8000 }
  ];

  const getEffectDescription = (upgrade: Upgrade): string[] => {
    const effects: string[] = [];
    const e = upgrade.effect;

    if (e.serverCapacity) effects.push(`+${e.serverCapacity} 서버 용량`);
    if (e.ticketSpeed) effects.push(`+${(e.ticketSpeed * 100).toFixed(0)}% 티켓 처리 속도`);
    if (e.uptimeBonus) effects.push(`+${e.uptimeBonus}% 업타임 보너스`);
    if (e.revenueMultiplier) effects.push(`+${(e.revenueMultiplier * 100).toFixed(0)}% 수익`);
    if (e.techDebtReduction) effects.push(`-${(e.techDebtReduction * 100).toFixed(0)}% 기술부채 증가`);

    return effects;
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader
          title="업그레이드"
          subtitle={`${purchasedUpgrades.length}/${upgrades.length} 보유`}
          icon={<Zap className="w-5 h-5 text-warning-400" />}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowServerUpgrade(true)}
              leftIcon={<Server className="w-4 h-4" />}
            >
              서버 Tier {serverTier}
            </Button>
          }
        />

        {/* Category filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors',
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-dark-400 hover:text-dark-200'
              )}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Upgrades list */}
        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredUpgrades.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-dark-500"
              >
                <Check className="w-12 h-12 mb-2" />
                <p className="text-sm">
                  {selectedCategory === 'all'
                    ? '모든 업그레이드를 구매했습니다!'
                    : '이 카테고리의 업그레이드를 모두 구매했습니다'}
                </p>
              </motion.div>
            ) : (
              filteredUpgrades.map((upgrade, index) => {
                const canAfford = money >= upgrade.cost;
                const hasRequirements = !upgrade.requires ||
                  upgrade.requires.every(r => purchasedUpgrades.includes(r));

                return (
                  <motion.div
                    key={upgrade.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'p-4 rounded-lg border bg-dark-800/50',
                      canAfford && hasRequirements
                        ? 'border-dark-700/50 hover:border-primary-500/50'
                        : 'border-dark-700/30 opacity-60'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getCategoryIcon(upgrade.category)}
                        </span>
                        <div>
                          <h4 className="font-medium text-dark-100 text-sm">
                            {upgrade.name}
                          </h4>
                          <p className="text-xs text-dark-400">
                            {upgrade.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant={canAfford ? 'info' : 'default'}>
                        ${upgrade.cost}
                      </Badge>
                    </div>

                    {/* Effects */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {getEffectDescription(upgrade).map((effect, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded bg-success-900/30 text-success-400"
                        >
                          {effect}
                        </span>
                      ))}
                    </div>

                    {/* Requirements warning */}
                    {!hasRequirements && upgrade.requires && (
                      <div className="flex items-center gap-1 mb-2 text-xs text-warning-400">
                        <Lock className="w-3 h-3" />
                        <span>
                          필요: {upgrade.requires.map(r =>
                            upgrades.find(u => u.id === r)?.name
                          ).join(', ')}
                        </span>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant={canAfford && hasRequirements ? 'primary' : 'secondary'}
                      fullWidth
                      onClick={() => purchaseUpgrade(upgrade.id)}
                      disabled={!canAfford || !hasRequirements}
                    >
                      {!hasRequirements
                        ? '선행 업그레이드 필요'
                        : !canAfford
                        ? '자금 부족'
                        : '구매'}
                    </Button>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Purchased count */}
        <div className="mt-4 pt-3 border-t border-dark-700 text-center">
          <p className="text-xs text-dark-400">
            {purchasedUpgrades.length}개 업그레이드 보유 중
          </p>
        </div>
      </Card>

      {/* Server Upgrade Modal */}
      <Modal
        isOpen={showServerUpgrade}
        onClose={() => setShowServerUpgrade(false)}
        title="서버 업그레이드"
        size="sm"
      >
        <div className="space-y-3">
          {serverTiers.map((tier) => {
            const isCurrent = serverTier === tier.tier;
            const isPurchased = serverTier > tier.tier;
            const canBuy = serverTier === tier.tier - 1 && money >= tier.cost;
            const isNext = serverTier === tier.tier - 1;

            return (
              <div
                key={tier.tier}
                className={cn(
                  'p-4 rounded-lg border',
                  isCurrent
                    ? 'bg-primary-900/20 border-primary-600'
                    : isPurchased
                    ? 'bg-success-900/10 border-success-700/30'
                    : 'bg-dark-800/50 border-dark-700/50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-dark-100">
                      Tier {tier.tier}: {tier.name}
                    </span>
                    {isCurrent && (
                      <Badge variant="info" size="sm">현재</Badge>
                    )}
                    {isPurchased && (
                      <Badge variant="success" size="sm">보유</Badge>
                    )}
                  </div>
                  {!isPurchased && !isCurrent && (
                    <span className="text-sm text-dark-400">
                      ${tier.cost}
                    </span>
                  )}
                </div>

                <p className="text-sm text-dark-400 mb-2">
                  최대 {tier.capacity.toLocaleString()}명 수용
                </p>

                {isNext && (
                  <Button
                    size="sm"
                    variant={canBuy ? 'success' : 'secondary'}
                    fullWidth
                    onClick={() => {
                      if (upgradeServer()) {
                        // Keep modal open to show result
                      }
                    }}
                    disabled={!canBuy}
                    leftIcon={<ChevronUp className="w-4 h-4" />}
                  >
                    {canBuy ? '업그레이드' : '자금 부족'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-dark-800/50">
          <p className="text-xs text-dark-400">
            💡 현재 서버 용량: {getServerCapacity().toLocaleString()}명
            (업그레이드 보너스 포함)
          </p>
        </div>
      </Modal>
    </>
  );
}
