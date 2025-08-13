import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  UsersIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
);

interface DailySummary {
  date: string;
  count: number;
  home_leads: number;
  features_leads: number;
  special_offer_leads: number;
  whatsapp_leads: number;
  chat_leads: number;
}

interface SourceStats {
  source_page: string;
  count: number;
}

interface LeadsOverviewData {
  dailySummary: DailySummary[];
  sourceStats: SourceStats[];
  totalLeads: number;
}

interface Lead {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  message: string;
  source_page: string;
  created_at: string;
}

export const LeadsOverview: React.FC = () => {
  const [overviewData, setOverviewData] = useState<LeadsOverviewData | null>(
    null,
  );
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch summary data
        const summaryResponse = await fetch(
          "/.netlify/functions/leads?summary=true",
        );
        if (!summaryResponse.ok) {
          throw new Error("Failed to fetch summary data");
        }
        const summaryData = await summaryResponse.json();
        setOverviewData(summaryData);

        // Fetch recent leads
        const leadsResponse = await fetch("/.netlify/functions/leads?limit=10");
        if (!leadsResponse.ok) {
          throw new Error("Failed to fetch recent leads");
        }
        const leadsData = await leadsResponse.json();
        setRecentLeads(leadsData.leads || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getSourcePageDisplayName = (sourcePage: string) => {
    const sourceMap: { [key: string]: string } = {
      "/": "Home Page",
      "/features": "Features Page",
      "/special-offer": "Special Offer",
      whatsapp: "WhatsApp",
      chat: "Live Chat",
      "/crm-import": "CRM Import",
    };
    return sourceMap[sourcePage] || sourcePage;
  };

  // Chart data preparation
  const chartData = {
    labels:
      overviewData?.dailySummary
        ?.slice(0, 14)
        .reverse()
        .map((day) => formatDate(day.date)) || [],
    datasets: [
      {
        label: "Daily Leads",
        data:
          overviewData?.dailySummary
            ?.slice(0, 14)
            .reverse()
            .map((day) => day.count) || [],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const sourceChartData = {
    labels:
      overviewData?.sourceStats?.map((source) =>
        getSourcePageDisplayName(source.source_page),
      ) || [],
    datasets: [
      {
        label: "Leads by Source",
        data: overviewData?.sourceStats?.map((source) => source.count) || [],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(236, 72, 153, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#6B7280",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
        },
      },
    },
  };

  const sourceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#6B7280",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-200 h-32 rounded-lg"></div>
            <div className="bg-gray-200 h-32 rounded-lg"></div>
            <div className="bg-gray-200 h-32 rounded-lg"></div>
          </div>
          <div className="bg-gray-200 h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error loading leads data</h3>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  const todayLeads = overviewData?.dailySummary?.[0]?.count || 0;
  const yesterdayLeads = overviewData?.dailySummary?.[1]?.count || 0;
  const changeFromYesterday = todayLeads - yesterdayLeads;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Leads */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Total Leads
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {overviewData?.totalLeads || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">All time</p>
            </div>
          </div>
        </div>

        {/* Today's Leads */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Today's Leads
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {todayLeads}
              </p>
              {changeFromYesterday !== 0 && (
                <p
                  className={`text-sm mt-1 ${changeFromYesterday > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {changeFromYesterday > 0 ? "+" : ""}
                  {changeFromYesterday} from yesterday
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top Source */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Top Source
              </h3>
              {overviewData?.sourceStats?.[0] && (
                <>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {getSourcePageDisplayName(
                      overviewData.sourceStats[0].source_page,
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {overviewData.sourceStats[0].count} leads
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Daily Leads - Last 14 Days
          </h3>
          <div className="h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Source Breakdown Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Leads by Source
          </h3>
          <div className="h-80">
            <Bar data={sourceChartData} options={sourceChartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Recent Leads
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lead.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.phone || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getSourcePageDisplayName(lead.source_page)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentLeads.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No leads found</p>
          </div>
        )}
      </div>
    </div>
  );
};
