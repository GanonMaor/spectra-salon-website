import React from 'react';
import { motion } from 'framer-motion';

export const MarketingFunnel2025: React.FC = () => {
  // Marketing Data for 2025
  const totalBudget = 1500 * 12; // $1,500/month × 12 months = $18,000
  const formFills = 1476;
  const creditCardEntries = 300;
  const churned = 204;
  const activeCustomers = 96;

  // Conversion Rates
  const formToCreditCard = (creditCardEntries / formFills) * 100;
  const creditCardToActive = (activeCustomers / creditCardEntries) * 100;
  const formToActive = (activeCustomers / formFills) * 100;

  // Cost Metrics
  const costPerLead = totalBudget / formFills;
  const costPerTrial = totalBudget / creditCardEntries;
  const costPerAcquisition = totalBudget / activeCustomers;

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;

  return (
    <div className="w-full">
      <div className="rounded-2xl bg-black/40 border border-amber-500/40 shadow-lg backdrop-blur-sm p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Marketing Performance 2025
          </h3>
          <p className="text-sm text-white/80 mb-4">
            Instagram-funded acquisition funnel with full conversion metrics
          </p>

          {/* Budget Overview */}
          <div className="flex items-center gap-6 text-xs text-white/70 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500/70 rounded-sm"></div>
              <span>Monthly Budget: $1,500</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500/70 rounded-sm"></div>
              <span>Total 2025: {formatCurrency(totalBudget)}</span>
            </div>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="space-y-6 mb-6">
          {/* Stage 1: Form Fills */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-sm font-medium text-white">Stage 1: Lead Forms</span>
                    <p className="text-xs text-white/60">Instagram ad campaigns</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-300">{formFills.toLocaleString()}</span>
                    <p className="text-xs text-white/60">forms filled</p>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-8 rounded-full flex items-center justify-end pr-3"
                    style={{ width: '100%' }}
                  >
                    <span className="text-white text-xs font-semibold">
                      CPL: {formatCurrency(costPerLead)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Arrow + Conversion Rate */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-amber-400 text-2xl mb-1">↓</div>
              <div className="text-xs text-amber-300 font-semibold bg-amber-500/20 px-3 py-1 rounded-full">
                {formatPercent(formToCreditCard)} conversion
              </div>
            </div>
          </div>

          {/* Stage 2: Credit Card Entries */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-sm font-medium text-white">Stage 2: Trial Sign-ups</span>
                    <p className="text-xs text-white/60">Entered credit card details</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-300">{creditCardEntries.toLocaleString()}</span>
                    <p className="text-xs text-white/60">trials started</p>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-8 rounded-full flex items-center justify-end pr-3"
                    style={{ width: `${(creditCardEntries / formFills) * 100}%` }}
                  >
                    <span className="text-white text-xs font-semibold">
                      Cost/Trial: {formatCurrency(costPerTrial)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Arrow + Conversion Rate */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-amber-400 text-2xl mb-1">↓</div>
              <div className="text-xs text-amber-300 font-semibold bg-amber-500/20 px-3 py-1 rounded-full">
                {formatPercent(creditCardToActive)} retained
              </div>
            </div>
          </div>

          {/* Stage 3: Active Customers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="relative"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-sm font-medium text-white">Stage 3: Active Customers</span>
                    <p className="text-xs text-white/60">Paying & engaged today</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-300">{activeCustomers.toLocaleString()}</span>
                    <p className="text-xs text-white/60">active now</p>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-8 rounded-full flex items-center justify-end pr-3"
                    style={{ width: `${(activeCustomers / formFills) * 100}%` }}
                  >
                    <span className="text-white text-xs font-semibold">
                      CPA: {formatCurrency(costPerAcquisition)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Churn Note */}
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-xs">
              ⚠️ {churned} churned or never activated ({formatPercent((churned / creditCardEntries) * 100)} of trials)
            </p>
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-white/60 mb-1">Total Budget</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-white/60 mb-1">Cost Per Lead</p>
            <p className="text-lg font-semibold text-blue-300">{formatCurrency(costPerLead)}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-white/60 mb-1">Cost Per Trial</p>
            <p className="text-lg font-semibold text-green-300">{formatCurrency(costPerTrial)}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-white/60 mb-1">Cost Per Customer</p>
            <p className="text-lg font-semibold text-emerald-300">{formatCurrency(costPerAcquisition)}</p>
          </div>
        </div>

        {/* Overall Conversion */}
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-300 uppercase tracking-wider mb-1">Overall Conversion</p>
              <p className="text-2xl font-bold text-white">{formatPercent(formToActive)}</p>
              <p className="text-xs text-white/70">From form fill to active customer</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-amber-300 uppercase tracking-wider mb-1">ROI Indicator</p>
              <p className="text-lg font-semibold text-white">
                {activeCustomers} customers @ {formatCurrency(costPerAcquisition)} CPA
              </p>
              <p className="text-xs text-white/70">Strong unit economics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
