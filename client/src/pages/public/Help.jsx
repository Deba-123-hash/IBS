import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Phone, MapPin, Printer, ArrowRight } from 'lucide-react';

export default function Help() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Help Desk & Support Center</h1>
        <p className="text-xs text-slate-500 mt-1">Physical proxy assistance and digital support protocols</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <HelpCircle className="h-5 w-5 text-emerald-600" />
            <span>Students Without Smartphones?</span>
          </div>
          <p>
            If your smartphone battery is depleted, you have lost connectivity, or do not carry a device, visit the Central Campus Service Desk.
          </p>
          <div className="pt-2">
            <Link
              to="/help-desk"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <span>Launch Help Desk Proxy Terminal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Phone className="h-5 w-5 text-emerald-600" />
            <span>Emergency Institutional Hotlines</span>
          </div>
          <ul className="space-y-2">
            <li><strong>Chief Warden Office:</strong> +91 98000 22222</li>
            <li><strong>Campus Security Gate 1:</strong> +91 98000 55555</li>
            <li><strong>Medical Health Center:</strong> +91 98000 77777</li>
            <li><strong>Estate & Maintenance Dispatch:</strong> +91 98000 44444</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
