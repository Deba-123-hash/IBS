import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { Building2, User, Wrench, ShieldCheck, Box } from 'lucide-react';

export default function Hostel() {
  const [roomData, setRoomData] = useState(null);
  const [gridData, setGridData] = useState(null);
  const [activeTab, setActiveTab] = useState('MY_ROOM');

  useEffect(() => {
    async function load() {
      try {
        const [rRes, gRes] = await Promise.all([
          apiClient.get('/hostels/my-room'),
          apiClient.get('/hostels/rooms-grid')
        ]);
        setRoomData(rRes.data);
        setGridData(gRes.data);
      } catch (err) {
        console.warn('Hostel load fallback', err);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hostel & Accommodations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aryabhatta Hall of Residence • Block B (West Wing)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('MY_ROOM')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'MY_ROOM' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            My Room (304)
          </button>
          <button
            onClick={() => setActiveTab('GRID')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'GRID' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Block B Occupancy Grid
          </button>
        </div>
      </div>

      {activeTab === 'MY_ROOM' ? (
        <div className="space-y-6">
          {/* Room Overview Card */}
          <div className="grid md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Living Unit</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">Room 304</div>
              <div className="text-xs text-slate-500 mt-1">Floor 3 • Double Occupancy</div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                Warden: <strong>Suresh Patel</strong> (+91 98765 11223)
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Allocated Roommate</span>
              <div className="text-base font-bold text-slate-900 mt-1">Rohan Mehra</div>
              <div className="text-xs text-slate-500 mt-0.5">Roll: CS2023019 • CSE Section A</div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                Contact: +91 98221 44556
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Active Maintenance Flag</span>
              <div className="text-base font-bold text-amber-900 mt-1">Bathroom Pipe Leakage</div>
              <div className="text-xs text-amber-700 mt-0.5">Ticket: CMP-2026-0042 (In Progress)</div>
              <div className="mt-4 pt-3 border-t border-amber-200 text-[11px] text-amber-800">
                Assigned: Ramesh Kumar (Plumber)
              </div>
            </div>
          </div>

          {/* Assigned Room Asset Inventory */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-3">Room Asset Inventory</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Asset Tag</th>
                    <th className="py-2.5 px-3 font-semibold">Fixture Name</th>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3 font-semibold">Inspection Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(roomData?.assets || [
                    { tag: 'AST-HST-B-304-01', name: 'High-Speed Ceiling Fan', category: 'ELECTRICAL', condition: 'OPERATIONAL' },
                    { tag: 'AST-HST-B-304-02', name: 'Wooden Study Table', category: 'FURNITURE', condition: 'OPERATIONAL' },
                    { tag: 'AST-HST-B-304-03', name: 'Ergonomic Mesh Chair', category: 'FURNITURE', condition: 'OPERATIONAL' },
                    { tag: 'AST-HST-B-304-04', name: 'Steel Almirah', category: 'FURNITURE', condition: 'OPERATIONAL' },
                    { tag: 'AST-HST-B-304-05', name: 'Washroom Sink & Tap Fixture', category: 'PLUMBING', condition: 'DAMAGED_LEAKING' }
                  ]).map((ast, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{ast.tag}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{ast.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{ast.category}</td>
                      <td className="py-2.5 px-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          ast.condition === 'OPERATIONAL'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {ast.condition.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Visual Room Grid for Warden / Inspector */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
            <div>
              <span className="font-bold text-slate-900">Block B Interactive Room Grid (24 Rooms)</span>
              <p className="text-slate-500">Live occupancy and maintenance status telemetry</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-blue-100 border border-blue-400"></span> Occupied (2/2)</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-100 border border-emerald-400"></span> Vacant Bed (1/2)</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-100 border border-red-400"></span> Active Repair</span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {(gridData?.rooms || []).map((r) => {
              const isMaint = r.status === 'MAINTENANCE_REQUIRED';
              const isPartial = r.status === 'PARTIALLY_VACANT';

              return (
                <div
                  key={r.id}
                  className={`rounded-xl border p-3 text-center transition hover:scale-105 ${
                    isMaint
                      ? 'border-red-400 bg-red-50 text-red-900 ring-2 ring-red-200'
                      : isPartial
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                      : 'border-blue-200 bg-blue-50 text-blue-900'
                  }`}
                >
                  <div className="text-xs font-extrabold">{r.roomNumber}</div>
                  <div className="text-[10px] font-medium mt-0.5">
                    {r.currentOccupancy}/{r.capacity} Beds
                  </div>
                  {isMaint && <div className="text-[9px] font-bold text-red-600 mt-1">LEAK</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
