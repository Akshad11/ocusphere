import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-left">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900">Store Terms & In-Store Pickup Policies</h1>
        <p className="text-xs text-neutral-500 mt-1">Effective: January 2026 · OcuSphere Optical Atelier</p>
      </div>

      <div className="prose prose-sm text-neutral-700 space-y-4 text-xs leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900">1. Product Reservation & Hold Policy</h2>
          <p>
            When an in-store reservation is placed online, OcuSphere physically isolates the selected frame variant in the Bandra Showroom pickup bay for exactly 72 hours (3 business days) from the confirmation timestamp.
          </p>
          <p>
            No credit card deposit or prepayment is required. If the customer does not arrive or reschedule within the 72-hour window, the frame is automatically released back to the floor inventory.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900">2. Optical Prescription Accuracy & Warranty</h2>
          <p>
            All custom prescription spectacle lenses glazed in our lab carry a 30-day adaptation guarantee. If you experience discomfort with newly prescribed progressive or high-cylinder lenses, our optometrists will re-evaluate and re-glaze your lenses at zero additional cost.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900">3. Demonstration Disclaimer</h2>
          <p>
            This application is a frontend demonstration UI utilizing synthetic in-memory data for software evaluation and testing. No real monetary transactions or commercial shipments occur.
          </p>
        </section>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-left">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900">Patient & Prescription Privacy Notice</h1>
        <p className="text-xs text-neutral-500 mt-1">Effective: January 2026 · Confidential Healthcare Standards</p>
      </div>

      <div className="prose prose-sm text-neutral-700 space-y-4 text-xs leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900">1. Optical Prescription Data Governance</h2>
          <p>
            OcuSphere handles patient refractive prescriptions (Sphere, Cylinder, Axis, Add, and Pupillary Distance) under clinical confidentiality standards. Refractive records are accessible strictly by authorized optometrists and licensed dispensing opticians.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900">2. Contact Notifications</h2>
          <p>
            Customers may opt in or opt out of SMS, WhatsApp, and email communications at any time. We send transactional alerts strictly for appointment verification, frame collection readiness, and annual vision check reminders.
          </p>
        </section>
      </div>
    </div>
  );
};
