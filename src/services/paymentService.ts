import { SubscriptionTier } from '../types';

// Check if Stripe is configured
export const isStripeConfigured = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  return key && key !== 'pk_test_your-key';
};

// Price IDs for each subscription tier (these should match your Stripe dashboard)
export const PRICE_IDS = {
  starter: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
    yearly: import.meta.env.VITE_STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly'
  },
  pro: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    yearly: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly'
  },
  enterprise: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
    yearly: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly'
  }
};

// Subscription plan details
export const SUBSCRIPTION_PLANS = {
  starter: {
    id: 'starter' as SubscriptionTier,
    name: 'Starter',
    description: '캐주얼 플레이어를 위한 플랜',
    monthlyPrice: 499, // in cents ($4.99)
    yearlyPrice: 4990, // in cents ($49.90)
    features: [
      '광고 제거',
      '저장 슬롯 3개',
      '1.5x 게임 속도',
      '기본 통계'
    ]
  },
  pro: {
    id: 'pro' as SubscriptionTier,
    name: 'Pro',
    description: '열정적인 플레이어를 위한 플랜',
    monthlyPrice: 999, // in cents ($9.99)
    yearlyPrice: 9990, // in cents ($99.90)
    features: [
      'Starter의 모든 기능',
      '무제한 저장 슬롯',
      '2x 게임 속도',
      '프리미엄 이벤트',
      '상세 통계 분석'
    ]
  },
  enterprise: {
    id: 'enterprise' as SubscriptionTier,
    name: 'Enterprise',
    description: '최고의 경험을 원하는 플레이어',
    monthlyPrice: 2999, // in cents ($29.99)
    yearlyPrice: 29990, // in cents ($299.90)
    features: [
      'Pro의 모든 기능',
      '3x 게임 속도',
      '팀 기능',
      'API 접근',
      '전용 서포트'
    ]
  }
};

// Create a checkout session (in production, this would call your backend)
export const createCheckoutSession = async (
  tier: Exclude<SubscriptionTier, 'free'>,
  billingPeriod: 'monthly' | 'yearly',
  userId: string,
  userEmail: string
): Promise<{ sessionId: string; url: string } | null> => {
  if (!isStripeConfigured()) {
    console.log('Stripe is not configured. Demo mode activated.');
    // Demo mode - simulate checkout
    return {
      sessionId: `demo_session_${Date.now()}`,
      url: '#demo-checkout'
    };
  }

  try {
    // In production, you would call your backend API to create a Stripe Checkout session
    // For now, we'll create a simple client-side redirect

    const priceId = PRICE_IDS[tier]?.[billingPeriod];
    if (!priceId) {
      throw new Error('Invalid price ID');
    }

    // Note: In a real implementation, you would:
    // 1. Call your backend API with the priceId, userId, and userEmail
    // 2. Your backend would create a Stripe Checkout session
    // 3. Return the session ID and URL to redirect the user

    // Example API call (replace with your actual API endpoint):
    // const response = await fetch('/api/create-checkout-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ priceId, userId, userEmail })
    // });
    // const { sessionId, url } = await response.json();
    // return { sessionId, url };

    // For demo purposes, return a simulated session
    return {
      sessionId: `cs_test_${Date.now()}`,
      url: `https://checkout.stripe.com/demo?price=${priceId}`
    };
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return null;
  }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (
  tier: Exclude<SubscriptionTier, 'free'>,
  billingPeriod: 'monthly' | 'yearly',
  userId: string,
  userEmail: string
): Promise<boolean> => {
  try {
    const session = await createCheckoutSession(tier, billingPeriod, userId, userEmail);
    if (!session) return false;

    if (session.url === '#demo-checkout') {
      // Demo mode - show alert and simulate success
      alert('데모 모드: 실제 결제는 Stripe 설정 후 가능합니다.');
      return true;
    }

    // Redirect to Stripe Checkout URL
    if (session.url) {
      window.location.href = session.url;
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to redirect to checkout:', error);
    return false;
  }
};

// Create customer portal session for managing subscriptions
export const createPortalSession = async (userId: string): Promise<string | null> => {
  if (!isStripeConfigured()) {
    console.log('Stripe is not configured. Demo mode activated.');
    alert('데모 모드: 실제 구독 관리는 Stripe 설정 후 가능합니다.');
    return null;
  }

  try {
    // In production, you would call your backend API to create a portal session
    // const response = await fetch('/api/create-portal-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId })
    // });
    // const { url } = await response.json();
    // return url;

    return `https://billing.stripe.com/p/demo?customer=${userId}`;
  } catch (error) {
    console.error('Failed to create portal session:', error);
    return null;
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string): Promise<boolean> => {
  if (!isStripeConfigured()) {
    console.log('Stripe is not configured. Demo mode activated.');
    return true;
  }

  try {
    // In production, call your backend API
    // const response = await fetch('/api/cancel-subscription', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ subscriptionId })
    // });
    // return response.ok;

    return true;
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    return false;
  }
};

// Verify subscription status
export const verifySubscription = async (userId: string): Promise<{
  isActive: boolean;
  tier: SubscriptionTier;
  expiresAt: Date | null;
} | null> => {
  if (!isStripeConfigured()) {
    return null;
  }

  try {
    // In production, verify with your backend
    // const response = await fetch(`/api/verify-subscription?userId=${userId}`);
    // return await response.json();

    return {
      isActive: false,
      tier: 'free',
      expiresAt: null
    };
  } catch (error) {
    console.error('Failed to verify subscription:', error);
    return null;
  }
};

// Format price for display
export const formatPrice = (priceInCents: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(priceInCents / 100);
};
