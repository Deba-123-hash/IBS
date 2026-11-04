import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  width = 'w-48',
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </div>
      {open && (
        <div
          role="menu"
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 ${width} rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 focus:outline-none`}
        >
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child, {
                  onSelect: () => setOpen(false)
                })
              : child
          )}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  onSelect,
  danger = false,
  icon: Icon,
  className = ''
}) => {
  const handleClick = (e) => {
    onClick?.(e);
    onSelect?.();
  };

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleClick}
      className={`w-full text-left rounded-lg px-3 py-2 text-xs font-semibold transition flex items-center gap-2.5 ${
        danger
          ? 'text-rose-600 hover:bg-rose-50'
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
      } ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0 text-slate-400" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
};

export default Dropdown;
