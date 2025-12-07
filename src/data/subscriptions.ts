import { SubscriptionPlan, SubscriptionTier } from '../types';

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    features: [
      '기본 게임플레이',
      '1개 저장 슬롯',
      '광고 포함',
      '기본 이벤트만'
    ],
    limits: {
      saveSlots: 1,
      speedMultiplier: 1,
      premiumEvents: false,
      noAds: false,
      exclusiveSkins: false
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 499, // $4.99
    yearlyPrice: 4990, // $49.90 (save 2 months)
    features: [
      '모든 Free 기능',
      '3개 저장 슬롯',
      '광고 제거',
      '1.5x 게임 속도',
      '기본 프리미엄 이벤트'
    ],
    limits: {
      saveSlots: 3,
      speedMultiplier: 1.5,
      premiumEvents: true,
      noAds: true,
      exclusiveSkins: false
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999, // $9.99
    yearlyPrice: 9990, // $99.90 (save 2 months)
    features: [
      '모든 Starter 기능',
      '무제한 저장 슬롯',
      '2x 게임 속도',
      '모든 프리미엄 이벤트',
      '독점 스킨 잠금해제',
      '우선 고객 지원',
      '베타 기능 조기 접근'
    ],
    limits: {
      saveSlots: -1, // unlimited
      speedMultiplier: 2,
      premiumEvents: true,
      noAds: true,
      exclusiveSkins: true
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2999, // $29.99
    yearlyPrice: 29990, // $299.90 (save 2 months)
    features: [
      '모든 Pro 기능',
      '3x 게임 속도',
      '팀 기능 (최대 5명)',
      '전용 서버',
      '맞춤형 브랜딩',
      '전담 매니저',
      'API 접근'
    ],
    limits: {
      saveSlots: -1,
      speedMultiplier: 3,
      premiumEvents: true,
      noAds: true,
      exclusiveSkins: true
    }
  }
];

export const getPlanById = (id: SubscriptionTier): SubscriptionPlan | undefined => {
  return subscriptionPlans.find(p => p.id === id);
};

export const formatPrice = (cents: number): string => {
  if (cents === 0) return '무료';
  return `$${(cents / 100).toFixed(2)}`;
};

export const getPlanBadgeColor = (tier: SubscriptionTier): string => {
  switch (tier) {
    case 'free': return 'bg-dark-600';
    case 'starter': return 'bg-primary-600';
    case 'pro': return 'bg-warning-600';
    case 'enterprise': return 'bg-gradient-to-r from-purple-600 to-pink-600';
  }
};

export const getStripePriceId = (tier: SubscriptionTier, yearly: boolean): string => {
  // These would be your actual Stripe Price IDs
  const priceIds: Record<SubscriptionTier, { monthly: string; yearly: string }> = {
    free: { monthly: '', yearly: '' },
    starter: {
      monthly: 'price_starter_monthly',
      yearly: 'price_starter_yearly'
    },
    pro: {
      monthly: 'price_pro_monthly',
      yearly: 'price_pro_yearly'
    },
    enterprise: {
      monthly: 'price_enterprise_monthly',
      yearly: 'price_enterprise_yearly'
    }
  };

  return yearly ? priceIds[tier].yearly : priceIds[tier].monthly;
};
