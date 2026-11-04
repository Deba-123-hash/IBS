import React, { useState } from 'react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { Input } from './Input.jsx';

export default {
  title: 'Organisms/Modal',
  component: Modal,
  tags: ['autodocs']
};

export const Interactive = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open WCAG 2.1 AA Dialog
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Apply for Campus Outstation Pass"
        subtitle="Automatic parent SMS notification and warden approval routing"
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Destination City"
            placeholder="e.g. Bhubaneswar, Odisha"
            required
          />
          <Input
            label="Emergency Contact Phone"
            placeholder="+91 98765 43210"
            required
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Lodge Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

