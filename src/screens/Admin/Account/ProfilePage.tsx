import React, { useState, useEffect } from "react";
import { UserCog, Camera, Save } from "lucide-react";
import { getAuthHeader } from "../../../api/client";

interface ProfileForm {
  full_name: string;
  email: string;
  phone: string;
  timezone: string;
  locale: string;
  avatar_url: string;
}

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    email: "",
    phone: "",
    timezone: "",
    locale: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/.netlify/functions/me", {
          headers: { ...getAuthHeader() },
        });
        if (response.ok) {
          const data = await response.json();
          setForm({
            full_name: data.user?.full_name || "",
            email: data.user?.email || "",
            phone: data.user?.phone || "",
            timezone: data.user?.timezone || "",
            locale: data.user?.locale || "",
            avatar_url: data.user?.avatar_url || "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/.netlify/functions/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          full_name: form.full_name,
          phone: form.phone,
          timezone: form.timezone,
          locale: form.locale,
          avatar_url: form.avatar_url,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Profile updated successfully" });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to update profile" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-neutral-200/60 shadow-lg">
        {/* Header */}
        <div className="border-b border-neutral-200/60 p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 flex items-center justify-center">
              <UserCog className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">Profile Settings</h1>
              <p className="text-neutral-600">Manage your account information and preferences</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-neutral-700 mb-3">Profile Picture</label>
            <div className="flex items-center gap-4">
              <img
                src={form.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.full_name || form.email)}&background=neutral&color=fff&size=64`}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover ring-2 ring-neutral-200"
              />
              <div className="flex-1">
                <input
                  type="url"
                  placeholder="Avatar URL"
                  value={form.avatar_url}
                  onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                />
                <p className="text-xs text-neutral-500 mt-1">Enter a URL for your profile picture</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
              <input
                type="email"
                value={form.email}
                readOnly
                className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                placeholder="+972-50-123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Timezone</label>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                <option value="">Select timezone</option>
                <option value="Asia/Jerusalem">Asia/Jerusalem (Israel)</option>
                <option value="Europe/London">Europe/London (UK)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Language</label>
              <select
                value={form.locale}
                onChange={(e) => setForm({ ...form, locale: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                <option value="">Select language</option>
                <option value="en-US">English (US)</option>
                <option value="he-IL">עברית (Hebrew)</option>
                <option value="en-GB">English (UK)</option>
              </select>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={clsx(
              "mt-6 rounded-lg p-4 text-sm",
              message.type === "success" 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            )}>
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={clsx(
                "inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-150",
                "bg-neutral-900 text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
