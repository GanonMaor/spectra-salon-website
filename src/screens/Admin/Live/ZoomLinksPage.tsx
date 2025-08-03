import React, { useState } from 'react';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { VideoCameraIcon, LinkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

const ZoomLinksPage: React.FC = () => {
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const generateZoomLink = () => {
    // Placeholder function - will be replaced with real Zoom API integration
    const meetingId = Math.random().toString(36).substring(2, 12);
    const zoomLink = `https://zoom.us/j/${meetingId}?pwd=spectra${Date.now()}`;
    setGeneratedLink(zoomLink);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Live', href: '/admin/live' },
        { label: 'Zoom Links', href: '/admin/live/zoom-links' }
      ]} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Zoom Links</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <VideoCameraIcon className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Generate Support Meeting Links
          </h2>
          <p className="text-gray-600">
            Create instant Zoom links for client support sessions.
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={generateZoomLink}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <VideoCameraIcon className="h-5 w-5 mr-2" />
            Generate New Zoom Link
          </button>

          {generatedLink && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Generated Link:</span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="flex items-center bg-white border border-gray-300 rounded-lg p-3">
                <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-900 break-all">{generatedLink}</span>
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Quick Actions:</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Share link directly with clients via email or chat</p>
              <p>• Schedule recurring meetings for ongoing support</p>
              <p>• Generate emergency support links for critical issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomLinksPage;