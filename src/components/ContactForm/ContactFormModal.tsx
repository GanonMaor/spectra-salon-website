import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
}

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch contacts from API
  const fetchContacts = async () => {
    try {
      const response = await fetch('/.netlify/functions/get-contacts');
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  // Fetch contacts when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/.netlify/functions/add-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Contact added successfully!');
        setFirstName('');
        setLastName('');
        setPhone('');
        
        // Refresh contacts list
        await fetchContacts();
      } else {
        setMessage('❌ Failed to add contact: ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Contact Management</h2>
                  <button
                    onClick={onClose}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Form */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Contact</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="John"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="+1-555-0100"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? '⏳ Adding...' : '➕ Add Contact'}
                    </button>

                    {message && (
                      <div className={`p-3 rounded-lg text-center ${
                        message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {message}
                      </div>
                    )}
                  </form>
                </div>

                {/* Contacts List */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      All Contacts ({contacts.length})
                    </h3>
                    <button
                      onClick={fetchContacts}
                      className="text-amber-600 hover:text-amber-700 font-medium"
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  {contacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No contacts yet. Add your first contact above!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contacts.map((contact) => (
                        <motion.div
                          key={contact.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="bg-amber-100 text-amber-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                  {contact.first_name[0]}{contact.last_name[0]}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">
                                    {contact.first_name} {contact.last_name}
                                  </h4>
                                  <p className="text-sm text-gray-600">📞 {contact.phone}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(contact.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContactFormModal;
