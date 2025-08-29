import React from 'react';
import FAQAccordion from '../components/support/FAQAccordion.jsx';
import LiveChatWidget from '../components/support/LiveChatWidget.jsx';
import TicketForm from '../components/support/TicketForm.jsx';

export default function SupportPage() {
  return (
    <div className="container-responsive py-10 space-y-10 text-gray-100">
      <h1 className="text-xl font-bold text-gray-100">پشتیبانی</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <FAQAccordion />
          <TicketForm />
        </div>
        <div className="md:col-span-1">
          <LiveChatWidget />
        </div>
      </div>
    </div>
  );
}
