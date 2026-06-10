import LorealAnalyticsPage from "./LorealAnalyticsPage";

const SPECTRA_ISRAEL_MARKET_ACCESS_CODE = "S7mK2pQ9";

export default function SpectraIsraelMarketAnalyticsPage() {
  return (
    <LorealAnalyticsPage
      accessCode={SPECTRA_ISRAEL_MARKET_ACCESS_CODE}
      sessionKey="spectra_israel_market_analytics_unlocked"
      title="Spectra Israel Market Analytics"
      subtitle="Spectra Platform — Israel Market"
      footerTitle="Spectra Israel Market Analytics"
      locale="en"
    />
  );
}
