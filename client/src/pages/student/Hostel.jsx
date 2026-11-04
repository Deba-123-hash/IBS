import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import {
  Building2,
  User,
  Wrench,
  ShieldCheck,
  Box,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Layers,
  Sparkles,
  X
} from 'lucide-react';

export default function Hostel() {
  const [roomData, setRoomData] = useState(null);
  const [gridData, setGridData] = useState(null);
  const [activeTab, setActiveTab] = useState('MY_ROOM');
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [rRes, gRes] = await Promise.all([
          apiClient.get('/hostel/me'),
          apiClient.get('/hostels/rooms-grid').catch(() => ({ data: [] }))
        ]);
        setRoomData(rRes.data?.data || rRes.data || rRes);
        setGridData(gRes.data?.data || gRes.data || gRes);
      } catch (err) {
        console.warn('Hostel load fallback', err);
      }
    }
    load();
  }, []);

  const room = roomData?.room || {
    roomNumber: '304',
    block: 'Block B (West Wing)',
    hostelName: 'Aryabhatta Hall of Residence',
    capacity: 2,
    floor: 3,
    warden: { name: 'Suresh Patel', phone: '+91 98765 11223' },
    roommate: { name: 'Rohan Mehra', roll: '2301105019', dept: 'CSE Section A', phone: '+91 98221 44556' }
  };

  const assets = [
    { id: 'ast_1', tag: 'AST-BLKB-304-BED1', name: 'Wooden Single Bed Frame & Mattress', category: 'Furniture', status: 'OPERATIONAL', lastInspected: '15 Aug 2026', condition: 'Pristine' },
    { id: 'ast_2', tag: 'AST-BLKB-304-TBL1', name: 'Ergonomic Study Desk & LED Lamp', category: 'Furniture', status: 'OPERATIONAL', lastInspected: '15 Aug 2026', condition: 'Good' },
    { id: 'ast_3', tag: 'AST-BLKB-304-FAN', name: 'Crompton 1200mm Ceiling Fan', category: 'Electrical', status: 'OPERATIONAL', lastInspected: '10 Sep 2026', condition: 'Operational' },
    { id: 'ast_4', tag: 'AST-BLKB-304-LAN', name: 'Cat6 1Gbps RJ45 Wall Port', category: 'Networking', status: 'OPERATIONAL', lastInspected: '12 Sep 2026', condition: 'Tested 980Mbps' },
    { id: 'ast_5', tag: 'AST-BLKB-304-PLMB', name: 'Bathroom Pressure Water Manifold', category: 'Plumbing', status: 'UNDER_MAINTENANCE', lastInspected: 'Yesterday', condition: 'Valve Seepage Repair' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Residential Life & Facilities
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Hostel Living Unit & Assets
          </h1>
          <p className="text-xs text-slate-500">
            {room.hostelName} • {room.block} • Floor {room.floor}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('MY_ROOM')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'MY_ROOM'
                ? 'bg-emerald-600 text-white shadow-soft'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            My Room (304)
          </button>
          <button
            onClick={() => setActiveTab('GRID')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'GRID'
                ? 'bg-emerald-600 text-white shadow-soft'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Floor 3 Occupancy Grid
          </button>
        </div>
      </div>

      {activeTab === 'MY_ROOM' ? (
        <div className="space-y-6">
          {/* Top Row: Room Info + Roommate + Maintenance Flag */}
          <div className="grid md:grid-cols-3 gap-5">
            
            {/* Living Unit Overview Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Living Unit
                </span>
                <div className="text-3xl font-black text-slate-900 mt-1">Room {room.roomNumber}</div>
                <div className="text-xs text-slate-500 mt-1">Floor {room.floor} • Double Occupancy (2 Beds)</div>

                {/* Occupancy visual indicator */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    2 / 2 Occupied
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                Hostel Warden: <strong>{room.warden?.name || 'Suresh Patel'}</strong> ({room.warden?.phone || '+91 98765 11223'})
              </div>
            </div>

            {/* Allocated Roommate Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Allocated Roommate
                </span>
                <div className="text-xl font-bold text-slate-900 mt-1">{room.roommate?.name || 'Rohan Mehra'}</div>
                <div className="text-xs text-slate-500 mt-0.5">Roll: {room.roommate?.roll || '2301105019'} • {room.roommate?.dept || 'CSE Section A'}</div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{room.roommate?.phone || '+91 98221 44556'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Shared Balcony & En-suite Washroom
              </div>
            </div>

            {/* Active Maintenance Flag Card */}
            <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Active Maintenance Order</span>
                </div>
                <div className="text-lg font-bold text-slate-900 mt-1">Bathroom Water Pipe Leakage</div>
                <div className="text-xs text-amber-800 mt-0.5 font-medium">Ticket: CMP-2026-0042 (In Progress)</div>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  Technician Ramesh Kumar assigned with replacement parts. Work in progress.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200/80 text-[11px] text-amber-900 font-semibold flex items-center justify-between">
                <span>Priority: High</span>
                <span className="text-emerald-700">Technician On Site</span>
              </div>
            </div>

          </div>

          {/* Assigned Room Asset Inventory */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Room Asset & Fixture Inventory</h2>
                <p className="text-xs text-slate-500">Track state, condition, and maintenance logs for in-room fixtures</p>
              </div>
              <span className="text-xs text-slate-400">Click any fixture for inspection logs</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {assets.map((ast) => (
                <div
                  key={ast.id}
                  onClick={() => setSelectedAsset(ast)}
                  className="cursor-pointer rounded-2xl border border-slate-200/80 p-4 bg-white shadow-2xs hover-lift transition-all hover:border-emerald-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {ast.tag}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ast.status === 'OPERATIONAL'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ast.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{ast.name}</h3>
                  <div className="text-[11px] text-slate-500 mt-1">Condition: {ast.condition}</div>
                  <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                    Inspected: {ast.lastInspected}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Floor 3 Occupancy Grid Tab */
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Block B — 3rd Floor Living Unit Grid</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Fully Occupied</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Vacant Bed</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> In Maintenance</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
            {[301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312].map((num) => {
              const isMyRoom = num === 304;
              return (
                <div
                  key={num}
                  className={`rounded-2xl border p-4 text-center transition ${
                    isMyRoom
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-soft ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700'
                  }`}
                >
                  <div className="text-sm font-black">{num}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">2 Beds</div>
                  {isMyRoom && (
                    <span className="mt-1.5 inline-block text-[9px] font-bold uppercase text-emerald-800 bg-emerald-200/70 px-1.5 py-0.2 rounded-full">
                      Your Room
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Asset Detail Inspection Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedAsset(null)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
          />

          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl z-10 animate-slide-down space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-500">{selectedAsset.tag}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedAsset.name}</h3>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Trade Category</span>
                <span className="font-semibold text-slate-800">{selectedAsset.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Current Status</span>
                <span className="font-bold text-emerald-700">{selectedAsset.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Audit Condition</span>
                <span className="font-semibold text-slate-800">{selectedAsset.condition}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Last Annual Inspection</span>
                <span className="font-semibold text-slate-800">{selectedAsset.lastInspected}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedAsset(null)}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold transition shadow-soft"
              >
                Close Asset Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
