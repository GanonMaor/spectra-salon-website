import React, { useState } from "react";
import { apiClient } from "../../../api/client";
import { Button } from "../../../components/ui/button";

const EmailSenderPage: React.FC = () => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await apiClient.sendEmail({ to, subject, html });
      setMessage("Email sent successfully");
      setLoading(false);
    } catch (err) {
      console.error("sendEmail error:", err);
      setError("Failed to send email");
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Send Email</h1>
      <form onSubmit={handleSend} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <input
            className="w-full px-3 py-2 border rounded-md"
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="client@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <input
            className="w-full px-3 py-2 border rounded-md"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">HTML</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md h-48"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="<p>Hello...</p>"
            required
          />
        </div>

        {message && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">{message}</div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">{error}</div>
        )}

        <Button type="submit" disabled={loading} className="px-6">
          {loading ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
};

export default EmailSenderPage;


