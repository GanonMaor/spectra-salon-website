import React, { useState, useEffect, useMemo } from 'react';
import { 
  HomeIcon, 
  TagIcon, 
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Lead {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  message?: string;
  source_page: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  ip_address?: string;
  created_at: string;
}

interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const fetchLeads = async (page = 1, sourceFilter = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (sourceFilter) {
        params.append('source_page', sourceFilter);
      }

      const response = await fetch(`/.netlify/functions/leads?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: LeadsResponse = await response.json();
      setLeads(data.leads);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1, filter);
  }, [filter]);

  // חישוב סטטיסטיקות לפי מקור הדף
  const sourceStats = useMemo(() => {
    const stats: { [key: string]: number } = {};
    leads.forEach(lead => {
      stats[lead.source_page] = (stats[lead.source_page] || 0) + 1;
    });
    return stats;
  }, [leads]);

  // רשימת מקורות ייחודיים לפילטר
  const uniqueSources = useMemo(() => {
    const sources = Array.from(new Set(leads.map(lead => lead.source_page)));
    return sources.sort();
  }, [leads]);

  const handlePageChange = (newPage: number) => {
    fetchLeads(newPage, filter);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourcePageInfo = (sourcePage: string) => {
    const pageInfo: { [key: string]: { name: string; color: string; icon: React.ComponentType<any> } } = {
      '/': { 
        name: 'Home Page', 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: HomeIcon 
      },
      '/lead-capture': { 
        name: 'Lead Capture', 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: DocumentTextIcon 
      },
      '/ugc-offer': { 
        name: 'UGC Offer', 
        color: 'bg-pink-100 text-pink-800 border-pink-200', 
        icon: TagIcon 
      },
      '/special-offer': { 
        name: 'Special Offer', 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        icon: TagIcon 
      },
      '/features': { 
        name: 'Features', 
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
        icon: ChartBarIcon 
      },
      '/about': { 
        name: 'About Us', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: DocumentTextIcon
      },
      '/contact': { 
        name: 'Contact', 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: DocumentTextIcon 
      }
    };
    return pageInfo[sourcePage] || { 
      name: sourcePage, 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: DocumentTextIcon 
    };
  };

  if (loading && leads.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Leads Management System
          </h1>
          <p className="text-gray-600 text-lg">Detailed analysis of leads by website source page</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Leads */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Leads</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{leads.length}</p>
          </div>

          {/* Home Page Leads */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Home Page</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{sourceStats['/'] || 0}</p>
          </div>

          {/* Special Offer Leads */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Special Offers</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {(sourceStats['/special-offer'] || 0) + (sourceStats['/ugc-offer'] || 0)}
            </p>
          </div>

          {/* Other Sources */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Other Pages</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {Object.entries(sourceStats).reduce((sum, [source, count]) => {
                if (source !== '/' && source !== '/special-offer' && source !== '/ugc-offer') {
                  return sum + count;
                }
                return sum;
              }, 0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Leads</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="source-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Source Page
              </label>
              <select
                id="source-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Sources</option>
                {uniqueSources.map(source => {
                  const info = getSourcePageInfo(source);
                  return (
                    <option key={source} value={source}>
                      {info.name} ({sourceStats[source] || 0} leads)
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setFilter('')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filter
              </button>
            </div>

            <div className="flex items-end justify-end">
              <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                Total: <span className="font-bold">{pagination.total}</span> leads
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading data...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-xl text-gray-500">No leads found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters or wait for new leads</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Leads List ({leads.length} leads)
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source Page
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => {
                    const sourceInfo = getSourcePageInfo(lead.source_page);
                    const SourceIcon = sourceInfo.icon;
                    
                    return (
                      <tr key={lead.id} className="hover:bg-blue-50 transition-colors">
                        {/* Lead Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm mr-3">
                              {lead.full_name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lead.full_name}</div>
                              <div className="text-sm text-gray-500">ID: #{lead.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                {lead.email}
                              </a>
                            </div>
                            {lead.phone && (
                              <div className="text-sm text-gray-900">
                                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                  {lead.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Company */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.company_name || <span className="text-gray-400">-</span>}
                        </td>

                        {/* Source Page */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setFilter(lead.source_page)}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-gray-300 bg-gray-50 text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            {sourceInfo.name}
                          </button>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(lead.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors text-sm">
                              View
                            </button>
                            <button className="text-green-600 hover:text-green-900 hover:bg-green-50 px-3 py-1 rounded-lg transition-colors text-sm">
                              Call
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium mx-1">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                      <span className="font-medium mx-1">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium ml-1">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-lg shadow-sm" aria-label="Pagination">
                      {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                        let page;
                        if (pagination.pages <= 5) {
                          page = i + 1;
                        } else if (pagination.page <= 3) {
                          page = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          page = pagination.pages - 4 + i;
                        } else {
                          page = pagination.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium first:rounded-r-lg last:rounded-l-lg hover:bg-gray-50 transition-colors ${
                              page === pagination.page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};