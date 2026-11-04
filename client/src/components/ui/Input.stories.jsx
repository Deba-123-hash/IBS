import React from 'react';
import { Input } from './Input.jsx';
import { Mail, Lock, Search } from 'lucide-react';

export default {
  title: 'Atoms/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    error: { control: 'text' },
    helper: { control: 'text' },
    placeholder: { control: 'text' },
    required: { control: 'boolean' }
  }
};

export const Default = {
  args: {
    label: 'Campus Email',
    placeholder: 'student@campusos.ac.in',
    helper: 'Use institutional Google / Microsoft account',
    required: true
  }
};

export const WithIcon = {
  args: {
    label: 'Search Records',
    icon: Search,
    placeholder: 'Search by roll number or student name...'
  }
};

export const WithValidationError = {
  args: {
    label: 'Permanent Address PIN Code',
    value: '7510',
    error: 'PIN code must be exactly 6 digits',
    required: true
  }
};

