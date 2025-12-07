import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Star, Building } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { subscriptionPlans, formatPrice, getPlanBadgeColor } from '../data/subscriptions';
import { Button, Badge, Card } from '../components/ui';
import { cn } from '../utils/helpers';
import { SubscriptionTier } from '../types';

interface PricingPageProps {
  onClose?: () => void;
}

export function PricingPage({ onClose }: PricingPageProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { user, updateSubscription } = useAuthStore();
  const currentPlan = user?.subscription || 'free';

  const planIcons: Record<SubscriptionTier, React.ReactNode> = {
    free: <Zap className="w-6 h-6" />,
    starter: <Star className="w-6 h-6" />,
    pro: <Crown className="w-6 h-6" />,
    enterprise: <Building className="w-6 h-6" />
  };

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (tier === 'free') return;

    setSelectedPlan(tier);
    setIsProcessing(true);

    // Simulate payment processing
    // In production, this would redirect to Stripe Checkout
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update subscription
    const expiresAt = Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000;
    updateSubscription(tier, expiresAt);

    setIsProcessing(false);
    setSelectedPlan(null);

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={cn(
          'text-sm transition-colors',
          !isYearly ? 'text-dark-100' : 'text-dark-400'
        )}>
          월간 결제
        </span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className={cn(
            'relative w-14 h-7 rounded-full transition-colors',
            isYearly ? 'bg-primary-600' : 'bg-dark-700'
          )}
        >
          <span
            className={cn(
              'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform',
              isYearly ? 'translate-x-8' : 'translate-x-1'
            )}
          />
        </button>
        <span className={cn(
          'text-sm transition-colors',
          isYearly ? 'text-dark-100' : 'text-dark-400'
        )}>
          연간 결제
          <Badge variant="success" size="sm" className="ml-2">
            2개월 무료
          </Badge>
        </span>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {subscriptionPlans.map((plan, index) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isPopular = plan.id === 'pro';
          const price = isYearly ? plan.yearlyPrice : plan.price;
          const monthlyPrice = isYearly ? Math.floor(plan.yearlyPrice / 12) : plan.price;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative',
                isPopular && 'md:-mt-4 md:mb-4'
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="premium">인기</Badge>
                </div>
              )}

              <Card
                className={cn(
                  'h-full flex flex-col',
                  isPopular && 'border-primary-500 bg-dark-800/70',
                  isCurrentPlan && 'ring-2 ring-success-500'
                )}
              >
                <div className="text-center mb-4">
                  <div className={cn(
                    'w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center',
                    getPlanBadgeColor(plan.id),
                    'text-white'
                  )}>
                    {planIcons[plan.id]}
                  </div>
                  <h3 className="text-lg font-semibold text-dark-100">
                    {plan.name}
                  </h3>
                  {isCurrentPlan && (
                    <Badge variant="success" size="sm" className="mt-1">
                      현재 플랜
                    </Badge>
                  )}
                </div>

                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-dark-100">
                    {formatPrice(monthlyPrice)}
                  </p>
                  {plan.price > 0 && (
                    <p className="text-sm text-dark-400">
                      {isYearly
                        ? `연 ${formatPrice(price)} (월 ${formatPrice(monthlyPrice)})`
                        : '/월'}
                    </p>
                  )}
                </div>

                <ul className="space-y-2 flex-1 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
                      <span className="text-dark-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isPopular ? 'primary' : isCurrentPlan ? 'success' : 'secondary'}
                  fullWidth
                  disabled={isCurrentPlan || (plan.id === 'free' && currentPlan !== 'free')}
                  isLoading={isProcessing && selectedPlan === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isCurrentPlan
                    ? '현재 플랜'
                    : plan.id === 'free'
                    ? '무료'
                    : '구독하기'}
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* FAQs or additional info */}
      <div className="text-center text-sm text-dark-400">
        <p>
          모든 유료 플랜은 30일 환불 보장이 제공됩니다.
        </p>
        <p className="mt-1">
          결제 관련 문의: support@uptime-game.com
        </p>
      </div>

      {/* Payment methods */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t border-dark-700">
        <span className="text-xs text-dark-500">결제 수단:</span>
        <div className="flex items-center gap-2 text-dark-400">
          <span className="text-lg">💳</span>
          <span className="text-xs">신용카드</span>
        </div>
        <div className="flex items-center gap-2 text-dark-400">
          <span className="text-lg">🍎</span>
          <span className="text-xs">Apple Pay</span>
        </div>
        <div className="flex items-center gap-2 text-dark-400">
          <span className="text-lg">📱</span>
          <span className="text-xs">Google Pay</span>
        </div>
      </div>
    </div>
  );
}
