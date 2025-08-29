import React from 'react';
import HeroSection from '../components/landing/HeroSection.jsx';
import ClubsSection from '../components/landing/ClubsSection.jsx';
import OffersSection from '../components/landing/OffersSection.jsx';
import BusinessCTASection from '../components/landing/BusinessCTASection.jsx';
import TrustSection from '../components/landing/TrustSection.jsx';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ClubsSection />
      <OffersSection />
      <BusinessCTASection />
      <TrustSection />
    </>
  );
}
