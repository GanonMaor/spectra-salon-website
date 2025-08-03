import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { 
  ChatBubbleLeftRightIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useActionLogger } from '../../../utils/actionLogger';

interface SupportTicket {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source_page?: string;
  last_message: string;
  status: 'new' | 'in_progress' | 'resolved';
  tags: string[];
  pipeline_stage: 'lead' | 'trial' | 'customer' | 'churned';
  assigned_to?: string;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_time?: string;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_type: 'client' | 'admin';
  sender_name: string;
  sender_id?: string;
  message: string;
  file_url?: string;
  timestamp: string;
}

const CustomerMessagesPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { logDataView, logButtonClick } = useActionLogger();

  useEffect(() => {
    loadTickets();
    logDataView('customer_messages', { 
      status_filter: statusFilter, 
      stage_filter: stageFilter 
    });
  }, [statusFilter, stageFilter, logDataView]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (stageFilter !== 'all') params.append('pipeline_stage', stageFilter);
      
      const response = await fetch(`/.netlify/functions/support-tickets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId: string) => {
    try {
      setMessagesLoading(true);
      const response = await fetch(`/.netlify/functions/support-messages?ticket_id=${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleTicketSelect = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    loadMessages(ticket.id);
    logButtonClick('ticket_selected', { ticket_id: ticket.id, status: ticket.status });
  };

  const sendReply = async (viaWhatsApp = false, template = null) => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      setSending(true);
      
      // If sending via WhatsApp and ticket has phone number
      if (viaWhatsApp && selectedTicket.phone) {
        let whatsappResponse;
        
        if (template) {
          // Send template message
          whatsappResponse = await fetch('/.netlify/functions/whatsapp-business-api/send-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: selectedTicket.phone,
              template_name: template.name,
              parameters: template.parameters || []
            })
          });
        } else {
          // Send regular message
          whatsappResponse = await fetch('/.netlify/functions/whatsapp-business-api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: selectedTicket.phone,
              message: replyMessage.trim()
            })
          });
        }

        const whatsappResult = await whatsappResponse.json();
        
        if (!whatsappResponse.ok && whatsappResult.whatsappUrl) {
          // Fallback to opening WhatsApp web
          window.open(whatsappResult.whatsappUrl, '_blank');
        } else if (!whatsappResponse.ok) {
          throw new Error(whatsappResult.error || 'Failed to send WhatsApp message');
        }
      }

      // Always save to our database
      const response = await fetch('/.netlify/functions/support-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          sender_type: 'admin',
          sender_name: 'Support Team', // This should come from user context
          message: template ? `[Template: ${template.name}] ${replyMessage.trim()}` : replyMessage.trim()
        })
      });

      if (response.ok) {
        setReplyMessage('');
        loadMessages(selectedTicket.id); // Reload messages
        loadTickets(); // Reload tickets to update last_message
        logButtonClick('support_reply_sent', { 
          ticket_id: selectedTicket.id, 
          via_whatsapp: viaWhatsApp,
          template: template?.name || null
        });
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const response = await fetch(`/.netlify/functions/support-tickets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId, status })
      });

      if (response.ok) {
        loadTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: status as any });
        }
        logButtonClick('ticket_status_updated', { ticket_id: ticketId, new_status: status });
      }
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-purple-100 text-purple-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'churned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        ticket.name.toLowerCase().includes(search) ||
        ticket.email?.toLowerCase().includes(search) ||
        ticket.last_message.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const newTicketsCount = tickets.filter(t => t.status === 'new').length;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Support', href: '/admin/support' },
        { label: 'Customer Messages', href: '/admin/support/messages' }
      ]} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Messages</h1>
          <p className="text-gray-600">Manage support tickets and chat conversations</p>
        </div>
        {newTicketsCount > 0 && (
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            {newTicketsCount} new message{newTicketsCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[600px]">
          {/* Left Panel - Tickets List */}
          <div className="lg:col-span-2 border-r border-gray-200">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FunnelIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Stages</option>
                  <option value="lead">Lead</option>
                  <option value="trial">Trial</option>
                  <option value="customer">Customer</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
            </div>

            {/* Tickets List */}
            <div className="overflow-y-auto max-h-[500px]">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading messages...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-8 text-center">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No messages found</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => handleTicketSelect(ticket)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{ticket.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {ticket.last_message}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        {ticket.email && (
                          <div className="flex items-center space-x-1">
                            <EnvelopeIcon className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{ticket.email}</span>
                          </div>
                        )}
                        {ticket.phone && (
                          <div className="flex items-center space-x-1">
                            <PhoneIcon className="w-3 h-3" />
                            <span>{ticket.phone}</span>
                          </div>
                        )}
                        {ticket.source_page === 'whatsapp' && (
                          <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.891 3.426"/>
                            </svg>
                            <span>WhatsApp</span>
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full ${getStageColor(ticket.pipeline_stage)}`}>
                        {ticket.pipeline_stage}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Conversation */}
          <div className="lg:col-span-3">
            {selectedTicket ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedTicket.name}</h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        {selectedTicket.email && (
                          <div className="flex items-center space-x-1">
                            <EnvelopeIcon className="w-4 h-4" />
                            <span>{selectedTicket.email}</span>
                          </div>
                        )}
                        {selectedTicket.phone && (
                          <div className="flex items-center space-x-1">
                            <PhoneIcon className="w-4 h-4" />
                            <span>{selectedTicket.phone}</span>
                          </div>
                        )}
                        {selectedTicket.source_page && (
                          <span className="text-blue-600">From: {selectedTicket.source_page}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_type === 'admin' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{message.sender_name}</span>
                            <span className={`text-xs ${
                              message.sender_type === 'admin' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Box */}
                <div className="p-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && !sending && sendReply()}
                      />
                      <button
                        onClick={() => sendReply(false)}
                        disabled={sending || !replyMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                    
                    {/* WhatsApp buttons and templates if phone number exists */}
                    {selectedTicket.phone && (
                      <div className="space-y-2">
                        {/* Regular WhatsApp Send */}
                        <div className="flex justify-center">
                          <button
                            onClick={() => sendReply(true)}
                            disabled={sending || !replyMessage.trim()}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.891 3.426"/>
                            </svg>
                            <span>Send via WhatsApp</span>
                          </button>
                        </div>

                        {/* Quick Reply Templates */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button
                            onClick={() => {
                              setReplyMessage("Hi! Thanks for reaching out to Spectra. I'll be happy to help you with your color intelligence needs. When would be a good time for a quick call?");
                            }}
                            className="px-2 py-1 bg-green-50 text-green-700 rounded border hover:bg-green-100 transition-colors"
                          >
                            📞 Schedule Call
                          </button>
                          
                          <button
                            onClick={() => {
                              setReplyMessage("Great question! Let me send you our demo video and pricing information. You can also book a live demo at your convenience: [DEMO_LINK]");
                            }}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded border hover:bg-blue-100 transition-colors"
                          >
                            🎥 Send Demo
                          </button>
                          
                          <button
                            onClick={() => {
                              setReplyMessage("Thanks for your interest! Our pricing starts at $299/month for single salon with all features included. Would you like me to prepare a custom quote for your needs?");
                            }}
                            className="px-2 py-1 bg-purple-50 text-purple-700 rounded border hover:bg-purple-100 transition-colors"
                          >
                            💰 Pricing Info
                          </button>
                          
                          <button
                            onClick={() => {
                              setReplyMessage("I understand you're having technical issues. Let me connect you with our technical support team right away. Can you describe the specific problem you're experiencing?");
                            }}
                            className="px-2 py-1 bg-red-50 text-red-700 rounded border hover:bg-red-100 transition-colors"
                          >
                            🔧 Tech Support
                          </button>
                        </div>

                        {/* Direct WhatsApp Link */}
                        <div className="flex justify-center">
                          <button
                            onClick={() => {
                              const whatsappUrl = `https://wa.me/972504322680?text=${encodeURIComponent(`Hi ${selectedTicket.name}, this is Maor from Spectra. I'm following up on your inquiry: "${selectedTicket.last_message}". How can I help you?`)}`;
                              window.open(whatsappUrl, '_blank');
                            }}
                            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                          >
                            <span>📱</span>
                            <span>Open WhatsApp Direct</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMessagesPage;