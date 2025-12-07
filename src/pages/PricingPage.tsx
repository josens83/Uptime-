import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Star, Building, ExternalLink, CreditCard, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { subscriptionPlans, formatPrice, getPlanBadgeColor } from '../data/subscriptions';
import { Button, Badge, Card } from '../components/ui';
import { cn } from '../utils/helpers';
import { SubscriptionTier } from '../types';
import {
  redirectToCheckout,
  createPortalSession,
  isStripeConfigured,
  SUBSCRIPTION_PLANS
} from '../services/paymentService';

interface PricingPageProps {
  onClose?: () => void;
}

export function PricingPage({ onClose }: PricingPageProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, updateSubscription } = useAuthStore();
  const currentPlan = user?.subscription || 'free';
  const stripeEnabled = isStripeConfigured();

  const planIcons: Record<SubscriptionTier, React.ReactNode> = {
    free: <Zap className="w-6 h-6" />,
    starter: <Star className="w-6 h-6" />,
    pro: <Crown className="w-6 h-6" />,
    enterprise: <Building className="w-6 h-6" />
  };

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (tier === 'free' || !user) return;

    setSelectedPlan(tier);
    setIsProcessing(true);
    setError(null);

    try {
      if (stripeEnabled) {
        // Use Stripe Checkout for real payments
        const billingPeriod = isYearly ? 'yearly' : 'monthly';
        const success = await redirectToCheckout(
          tier as Exclude<SubscriptionTier, 'free'>,
          billingPeriod,
          user.id,
          user.email
        );

        if (!success) {
          setError('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      } else {
        // Demo mode - simulate payment
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update subscription locally
        const expiresAt = Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000;
        updateSubscription(tier, expiresAt);

        if (onClose) {
          onClose();
        }
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      const portalUrl = await createPortalSession(user.id);
      if (portalUrl) {
        window.open(portalUrl, '_blank');
      }
    } catch (err) {
      console.error('Portal error:', err);
      setError('구독 관리 페이지를 열 수 없습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo mode notice */}
      {!stripeEnabled && (
        <div className="p-4 rounded-lg bg-warning-900/20 border border-warning-700/30">
          <div className="flex items-center gap-2 text-warning-400">
            <Shield className="w-5 h-5" />
            <span className="font-medium">데모 모드</span>
          </div>
          <p className="text-sm text-warning-400/80 mt-1">
            Stripe가 설정되지 않아 데모 모드로 실행 중입니다. 실제 결제 없이 구독이 활성화됩니다.
          </p>
        </div>
      )}

      {/* Current subscription management */}
      {currentPlan !== 'free' && (
        <Card className="p-4 bg-success-900/10 border-success-700/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">현재 플랜</p>
              <p className="text-lg font-semibold text-success-400">
                {subscriptionPlans.find(p => p.id === currentPlan)?.name} 구독 중
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManageSubscription}
              rightIcon={<ExternalLink className="w-4 h-4" />}
            >
              구독 관리
            </Button>
          </div>
        </Card>
      )}

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

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-lg bg-danger-900/20 border border-danger-700/30">
          <p className="text-sm text-danger-400">{error}</p>
        </div>
      )}

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
                    : stripeEnabled
                    ? '결제하기'
                    : '구독하기 (데모)'}
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Secure payment notice */}
      <div className="flex items-center justify-center gap-2 text-dark-400">
        <Shield className="w-4 h-4" />
        <span className="text-sm">
          {stripeEnabled
            ? 'Stripe를 통한 안전한 결제'
            : '데모 모드 - 실제 결제 없음'}
        </span>
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
          <CreditCard className="w-4 h-4" />
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
