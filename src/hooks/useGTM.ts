// Google Tag Manager tracking hook
interface GTMEvent {
  event: string;
  event_category?: string;
  event_action?: string;
  event_label?: string;
  value?: number;
  // Lead specific fields
  lead_source?: string;
  lead_page?: string;
  user_email?: string;
  // Custom parameters
  [key: string]: any;
}

declare global {
  interface Window {
    dataLayer: GTMEvent[];
  }
}

export const useGTM = () => {
  const pushEvent = (eventData: GTMEvent) => {
    try {
      // Initialize dataLayer if not exists
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(eventData);
        console.log('📊 GTM Event pushed:', eventData);
      }
    } catch (error) {
      console.warn('Failed to push GTM event:', error);
    }
  };

  // Lead form submission tracking
  const trackLeadSubmission = (data: {
    email: string;
    full_name: string;
    source_page: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    company_name?: string;
  }) => {
    pushEvent({
      event: 'lead_submission',
      event_category: 'Lead Generation',
      event_action: 'Form Submit',
      event_label: data.source_page,
      lead_source: data.utm_source || 'direct',
      lead_page: data.source_page,
      user_email: data.email,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      company_name: data.company_name,
      full_name: data.full_name
    });
  };

  // Page view tracking
  const trackPageView = (pagePath: string, pageTitle?: string) => {
    pushEvent({
      event: 'page_view',
      page_path: pagePath,
      page_title: pageTitle || document.title
    });
  };

  // CTA button clicks
  const trackCTAClick = (buttonText: string, location: string) => {
    pushEvent({
      event: 'cta_click',
      event_category: 'CTA',
      event_action: 'Click',
      event_label: buttonText,
      cta_location: location
    });
  };

  // Video interactions
  const trackVideoPlay = (videoName: string, location: string) => {
    pushEvent({
      event: 'video_play',
      event_category: 'Video',
      event_action: 'Play',
      event_label: videoName,
      video_location: location
    });
  };

  const trackVideoPause = (videoName: string, currentTime: number) => {
    pushEvent({
      event: 'video_pause',
      event_category: 'Video', 
      event_action: 'Pause',
      event_label: videoName,
      video_current_time: currentTime
    });
  };

  // Demo booking tracking
  const trackDemoBooking = (method: string) => {
    pushEvent({
      event: 'demo_booking',
      event_category: 'Conversion',
      event_action: 'Demo Book',
      event_label: method, // 'calendly', 'whatsapp', etc.
      value: 1
    });
  };

  // Trial signup tracking
  const trackTrialSignup = (source: string) => {
    pushEvent({
      event: 'trial_signup',
      event_category: 'Conversion',
      event_action: 'Trial Start',
      event_label: source,
      value: 1
    });
  };

  // Feature page interactions
  const trackFeatureView = (featureName: string) => {
    pushEvent({
      event: 'feature_view',
      event_category: 'Feature',
      event_action: 'View',
      event_label: featureName
    });
  };

  // Social media clicks
  const trackSocialClick = (platform: string, action: string) => {
    pushEvent({
      event: 'social_click',
      event_category: 'Social',
      event_action: action, // 'whatsapp', 'instagram', 'email'
      event_label: platform
    });
  };

  // Scroll depth tracking
  const trackScrollDepth = (percentage: number, page: string) => {
    pushEvent({
      event: 'scroll_depth',
      event_category: 'Engagement',
      event_action: 'Scroll',
      event_label: `${percentage}%`,
      page_path: page,
      scroll_depth: percentage
    });
  };

  // File download tracking
  const trackDownload = (fileName: string, fileType: string) => {
    pushEvent({
      event: 'file_download',
      event_category: 'Download',
      event_action: fileType,
      event_label: fileName
    });
  };

  // Error tracking
  const trackError = (errorType: string, errorMessage: string, page: string) => {
    pushEvent({
      event: 'error',
      event_category: 'Error',
      event_action: errorType,
      event_label: errorMessage,
      page_path: page
    });
  };

  return {
    pushEvent,
    trackLeadSubmission,
    trackPageView,
    trackCTAClick,
    trackVideoPlay,
    trackVideoPause,
    trackDemoBooking,
    trackTrialSignup,
    trackFeatureView,
    trackSocialClick,
    trackScrollDepth,
    trackDownload,
    trackError
  };
};