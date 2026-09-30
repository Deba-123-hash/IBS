import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  width = 'w-48'
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 ${width} rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, danger = false, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-full text-left rounded-lg px-3 py-2 text-xs font-medium transition flex items-center gap-2 ${
      danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
    } ${className}`}
  >
    {children}
  </button>
);

export default Dropdown;
