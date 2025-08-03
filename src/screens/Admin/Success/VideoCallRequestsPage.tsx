import React from 'react';
import { Breadcrumbs } from '../../../components/Breadcrumbs';

const VideoCallRequestsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Success', href: '/admin/success' },
        { label: 'Video Call Requests', href: '/admin/success/video-call-requests' }
      ]} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Video Call Requests</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Support Call Management
        </h2>
        <p className="text-gray-600 mb-6">
          Manage client video call requests and schedule support sessions.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg">
          🚧 Coming Soon - Call Scheduling
        </div>
      </div>
    </div>
  );
};

export default VideoCallRequestsPage;