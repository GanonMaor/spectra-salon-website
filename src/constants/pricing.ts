// Pricing plans configuration 
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: 'USD' | 'ILS';
  name: 'Single User',
    price: 39,
    currency: 'USD',
    sumitPlanId: 593256375, // Real SUMIT Product ID
    features: [
      '1 User Account',
      'Basic Analytics', 
      'Email Support',
      'Mobile App Access'
    ]
  },
  {
    id: 'multi-users',
    name: 'Multi Users',
    price: 79,
    currency: 'USD',
    sumitPlanId: 593256263, // Real SUMIT Product ID
    popular: true,
    features: [
      'Up to 4 Users',
      'Advanced Analytics',
      'Priority Support',
      'Mobile App Access',
      'Custom Branding',
      'API Access'
    ]
  },
  {
    id: 'multi-plus',
    name: 'Multi Plus',
    price: 129,
    currency: 'USD',
    sumitPlanId: 593256234, // Real SUMIT Product ID
    features: [
      'Up to 10 Users',
      'Enterprise Analytics',
      'Dedicated Support',
      'Mobile App Access',
      'Custom Branding',
      'API Access',
      'Advanced Integrations',
      'Team Training'
    ]
  },
  {
    id: 'power-salon',
    name: 'Power Salon',
    price: 189,
    currency: 'USD',
    sumitPlanId: 620451619, // Real SUMIT Product ID
    features: [
      'Up to 20 Users',
      'Enterprise Analytics',
      '24/7 Support',
      'Mobile App Access',
      'Custom Branding',
      'API Access',
      'Advanced Integrations',
      'Team Training',
      'Custom Features',
      'SLA Guarantee'
    ]
  }
];

// Helper to get plan by dropdown value
export function getPlanByDropdownValue(dropdownValue: string): PricingPlan | undefined {
  // Handle dropdown values like "Single User – $39/month"
  const planName = dropdownValue.split('–')[0].trim();
  return PRICING_PLANS.find(plan => plan.name === planName);
}

// Helper to get plan by ID
export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find(plan => plan.id === planId);
}

// Helper to get plan by SUMIT ID
export function 
// Format plan for dropdown display
export function formatPlanForDropdown(plan: PricingPlan): string {
  const currencySymbol = plan.currency === 'USD' ? '$' : '₪';
  return `${plan.name} – ${currencySymbol}${plan.price}/month`;
}

// Get all plans formatted for dropdown
export function getPlansForDropdown(): string[] {
  return PRICING_PLANS.map(formatPlanForDropdown);
}
