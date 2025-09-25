import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client";
import { Button } from "../../components/ui/button";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({ fullName: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) { setError("Please fill all required fields"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    try {
      setLoading(true);
      await apiClient.signup({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone });
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Sign up failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 py-12 px-4">
      <form onSubmit={onSubmit} className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-600">Join Spectra Salon</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input name="fullName" value={form.fullName} onChange={onChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" name="email" value={form.email} onChange={onChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={onChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
          <input type="password" name="password" value={form.password} onChange={onChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" required />
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">{error}</div>}
        <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50">
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
}
