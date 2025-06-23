'use client';

import AdminLayout from '@/components/AdminLayout';
import ProfileContent from './components/ProfileContent.jsx';

export default function ProfilePage() {
  return (
    <AdminLayout activeItem="profile" pageTitle="Profile">
      <ProfileContent />
    </AdminLayout>
  );
}
