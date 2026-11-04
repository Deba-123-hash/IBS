import React from 'react';
import { Button } from './Button.jsx';
import { Sparkles, ArrowRight, Trash2, Check } from 'lucide-react';

export default {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'danger', 'success', 'ghost']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' }
  }
};

export const Primary = {
  args: {
    children: 'Confirm Action',
    variant: 'primary',
    size: 'md'
  }
};

export const Secondary = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
    size: 'md'
  }
};

export const WithIcon = {
  args: {
    children: 'Explore Intelligence',
    variant: 'primary',
    icon: Sparkles,
    size: 'md'
  }
};

export const Danger = {
  args: {
    children: 'Deactivate Account',
    variant: 'danger',
    icon: Trash2,
    size: 'md'
  }
};

export const LoadingState = {
  args: {
    children: 'Submitting Request...',
    variant: 'primary',
    loading: true,
    size: 'md'
  }
};

