import { supabase } from './supabaseClient';

// Lead types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source?: string;
  cta_clicked?: string;
  message?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  summit_status?: 'trial' | 'active' | 'cancelled' | 'pending';
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  cta_clicked?: string;
  message?: string;
  user_id?: string;
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  cta_clicked?: string;
  message?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  summit_status?: 'trial' | 'active' | 'cancelled' | 'pending';
}

// Get all leads (admin only)
export async function getAllLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
}

// Get leads with pagination and filters
export async function getLeads(
  page: number = 1,
  limit: number = 50,
  status?: string,
  source?: string
) {
  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  if (source) {
    query = query.eq('source', source);
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

// Get single lead by ID (admin only)
export async function getLeadById(id: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

// Create new lead (can be anonymous for contact forms)
export async function createLead(leadData: CreateLeadData) {
  const { data, error } = await supabase
    .from('leads')
    .insert(leadData)
    .select()
    .single();

  return { data, error };
}

// Update lead (admin only)
export async function updateLead(id: string, updates: UpdateLeadData) {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

// Delete lead (admin only)
export async function deleteLead(id: string) {
  const { data, error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  return { data, error };
}

// Get leads by email (for checking duplicates)
export async function getLeadsByEmail(email: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });

  return { data, error };
}

// Get leads statistics (admin only)
export async function getLeadsStats() {
  const { data: totalLeads, error: totalError } = await supabase
    .from('leads')
    .select('id', { count: 'exact' });

  const { data: statusStats, error: statusError } = await supabase
    .from('leads')
    .select('status')
    .then(({ data, error }) => {
      if (error) return { data: null, error };
      
      const stats = data?.reduce((acc: any, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {});

      return { data: stats, error: null };
    });

  const { data: sourceStats, error: sourceError } = await supabase
    .from('leads')
    .select('source')
    .then(({ data, error }) => {
      if (error) return { data: null, error };
      
      const stats = data?.reduce((acc: any, lead) => {
        const source = lead.source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      return { data: stats, error: null };
    });

  if (totalError || statusError || sourceError) {
    return { 
      data: null, 
      error: totalError || statusError || sourceError 
    };
  }

  return {
    data: {
      total: totalLeads?.length || 0,
      byStatus: statusStats,
      bySource: sourceStats
    },
    error: null
  };
}

// Search leads
export async function searchLeads(query: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20);

  return { data, error };
} 