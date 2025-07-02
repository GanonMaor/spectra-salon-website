import { supabase } from './supabaseClient';

// CTA Click types
export interface CTAClick {
  id: string;
  button_name: string;
  page_url: string;
  device_type?: string;
  user_agent?: string;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  referrer?: string;
  timestamp: string;
}

export interface CreateCTAClickData {
  button_name: string;
  page_url: string;
  device_type?: string;
  user_agent?: string;
  user_id?: string;
  session_id?: string;
  referrer?: string;
}

// Track CTA click (can be called by anyone)
export async function trackCTAClick(clickData: CreateCTAClickData) {
  // Get device type from user agent if not provided
  const deviceType = clickData.device_type || getDeviceType(clickData.user_agent);
  
  const { data, error } = await supabase
    .from('cta_clicks')
    .insert({
      ...clickData,
      device_type: deviceType,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();

  return { data, error };
}

// Get all CTA clicks (admin only)
export async function getAllCTAClicks() {
  const { data, error } = await supabase
    .from('cta_clicks')
    .select('*')
    .order('timestamp', { ascending: false });

  return { data, error };
}

// Get CTA clicks with pagination and filters
export async function getCTAClicks(
  page: number = 1,
  limit: number = 50,
  buttonName?: string,
  pageUrl?: string,
  deviceType?: string,
  dateFrom?: string,
  dateTo?: string
) {
  let query = supabase
    .from('cta_clicks')
    .select('*', { count: 'exact' })
    .order('timestamp', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (buttonName) {
    query = query.eq('button_name', buttonName);
  }

  if (pageUrl) {
    query = query.eq('page_url', pageUrl);
  }

  if (deviceType) {
    query = query.eq('device_type', deviceType);
  }

  if (dateFrom) {
    query = query.gte('timestamp', dateFrom);
  }

  if (dateTo) {
    query = query.lte('timestamp', dateTo);
  }

  const { data, error, count } = await query;

  return { 
    data, 
    error, 
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
}

// Get CTA clicks statistics (admin only)
export async function getCTAStats(dateFrom?: string, dateTo?: string) {
  let query = supabase.from('cta_clicks').select('*');
  
  if (dateFrom) {
    query = query.gte('timestamp', dateFrom);
  }
  
  if (dateTo) {
    query = query.lte('timestamp', dateTo);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return { data: null, error: new Error('No data returned') };
  }

  // Calculate statistics
  const stats = {
    total: data.length,
    byButton: {} as Record<string, number>,
    byPage: {} as Record<string, number>,
    byDevice: {} as Record<string, number>,
    byHour: {} as Record<string, number>,
    byDay: {} as Record<string, number>,
    uniqueUsers: new Set<string>(),
    uniqueSessions: new Set<string>()
  };

  data.forEach((click) => {
    // By button
    stats.byButton[click.button_name] = (stats.byButton[click.button_name] || 0) + 1;
    
    // By page
    stats.byPage[click.page_url] = (stats.byPage[click.page_url] || 0) + 1;
    
    // By device
    const device = click.device_type || 'unknown';
    stats.byDevice[device] = (stats.byDevice[device] || 0) + 1;
    
    // By hour
    const hour = new Date(click.timestamp).getHours();
    stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
    
    // By day
    const day = new Date(click.timestamp).toISOString().split('T')[0];
    stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    
    // Unique users and sessions
    if (click.user_id) {
      stats.uniqueUsers.add(click.user_id);
    }
    if (click.session_id) {
      stats.uniqueSessions.add(click.session_id);
    }
  });

  return {
    data: {
      ...stats,
      uniqueUsers: stats.uniqueUsers.size,
      uniqueSessions: stats.uniqueSessions.size
    },
    error: null
  };
}

// Get popular buttons (admin only)
export async function getPopularButtons(limit: number = 10) {
  const { data, error } = await supabase
    .from('cta_clicks')
    .select('button_name')
    .then(({ data, error }) => {
      if (error) return { data: null, error };
      
      const buttonCounts = data?.reduce((acc: Record<string, number>, click) => {
        acc[click.button_name] = (acc[click.button_name] || 0) + 1;
        return acc;
      }, {});

      const sortedButtons = Object.entries(buttonCounts || {})
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([button, count]) => ({ button, count }));

      return { data: sortedButtons, error: null };
    });

  return { data, error };
}

// Get conversion funnel (admin only)
export async function getConversionFunnel(funnelSteps: string[]) {
  const { data, error } = await supabase
    .from('cta_clicks')
    .select('button_name, session_id, timestamp')
    .in('button_name', funnelSteps)
    .order('timestamp', { ascending: true });

  if (error) {
    return { data: null, error };
  }

  // Group by session and analyze funnel
  const sessionFunnels: Record<string, string[]> = {};
  
  data?.forEach((click) => {
    if (!click.session_id) return;
    
    if (!sessionFunnels[click.session_id]) {
      sessionFunnels[click.session_id] = [];
    }
    sessionFunnels[click.session_id].push(click.button_name);
  });

  // Calculate funnel statistics
  const funnelStats = funnelSteps.map((step, index) => {
    const sessionsAtStep = Object.values(sessionFunnels).filter(
      (sessionSteps) => sessionSteps.includes(step)
    ).length;

    const previousStep = index > 0 ? funnelSteps[index - 1] : null;
    const sessionsAtPreviousStep = previousStep
      ? Object.values(sessionFunnels).filter(
          (sessionSteps) => sessionSteps.includes(previousStep)
        ).length
      : Object.keys(sessionFunnels).length;

    const conversionRate = sessionsAtPreviousStep > 0 
      ? (sessionsAtStep / sessionsAtPreviousStep) * 100 
      : 0;

    return {
      step,
      sessions: sessionsAtStep,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  });

  return { data: funnelStats, error: null };
}

// Helper function to detect device type from user agent
function getDeviceType(userAgent?: string): string {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  
  return 'desktop';
}

// Generate session ID for anonymous tracking
export function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Get or create session ID from localStorage
export function getSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = localStorage.getItem('spectra_session_id');
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('spectra_session_id', sessionId);
  }
  
  return sessionId;
} 