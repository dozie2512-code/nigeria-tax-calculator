/**
 * Pricing Plans Configuration
 * Centralized configuration for all subscription plans
 */
const PLANS = {
  business: {
    fullPrice: { GBP: 30, EUR: 40, USD: 50, NGN: 25000 },
    offerPrice: { GBP: 30, EUR: 40, USD: 50, NGN: 25000 },
    taxAccountantPrice: { GBP: 50, EUR: 62, USD: 75, NGN: 75000 },
    additionalBusinessPrice: { GBP: 20, EUR: 25, USD: 30, NGN: 30000, annual: true },
    defaultBusinesses: 1,
    trialDays: 7,
    maxUsers: 2,
    buyLink: 'https://buy.stripe.com/business-plan',
    taxAccountantLink: 'https://buy.stripe.com/hire-tax-accountant-business'
  },
  company: {
    fullPrice: { GBP: 80, EUR: 100, USD: 120, NGN: 80000 },
    offerPrice: { GBP: 60, EUR: 75, USD: 90, NGN: 60000 },
    taxAccountantPrice: { GBP: 67, EUR: 83, USD: 100, NGN: 100000 },
    additionalBusinessPrice: { GBP: 30, EUR: 37.5, USD: 40, NGN: 50000, annual: true },
    defaultBusinesses: 1,
    trialDays: 7,
    maxUsers: 3,
    buyLink: 'https://buy.stripe.com/company-plan',
    taxAccountantLink: 'https://buy.stripe.com/hire-tax-accountant-company'
  },
  enterprise: {
    fullPrice: { GBP: 150, EUR: 187, USD: 225, NGN: 150000 },
    offerPrice: { GBP: 100, EUR: 125, USD: 150, NGN: 100000 },
    additionalBusinessPrice: { GBP: 20, EUR: 25, USD: 30, annual: true },
    defaultBusinesses: 3,
    trialDays: 7,
    maxUsers: 3,
    buyLink: 'https://buy.stripe.com/enterprise-plan',
    addonBusinessLink: 'https://buy.stripe.com/hire-tax-accountant-business',
    addonCompanyLink: 'https://buy.stripe.com/hire-tax-accountant-company'
  }
};

// Configuration constants
const OFFER_DURATION_MS = 72 * 60 * 60 * 1000; // 72 hours in milliseconds
const STORAGE_KEY_OFFER = 'offerEndTimestamp';
