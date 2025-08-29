import React from 'react';
import ProfileHeader from '../components/profile/ProfileHeader.jsx';
import SavedDiscountsList from '../components/profile/SavedDiscountsList.jsx';
import Achievements from '../components/profile/Achievements.jsx';
import EditProfileForm from '../components/profile/EditProfileForm.jsx';
import ReviewsList from '../components/social/ReviewsList.jsx';

export default function ProfilePage() {
  return (
    <div className="container-responsive py-10 space-y-10 text-gray-100">
      <ProfileHeader />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <SavedDiscountsList />
          <Achievements />
          <ReviewsList />
        </div>
        <div className="md:col-span-1">
          <EditProfileForm />
        </div>
      </div>
    </div>
  );
}
