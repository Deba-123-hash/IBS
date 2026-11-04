import '../src/styles/index.css';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'campus-light',
      values: [
        { name: 'campus-light', value: '#F8FAF9' },
        { name: 'pure-white', value: '#FFFFFF' },
        { name: 'campus-dark', value: '#0F172A' },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile Phone (iPhone / Android)',
          styles: { width: '375px', height: '667px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (iPad Mini)',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop Monitor',
          styles: { width: '1280px', height: '800px' },
          type: 'desktop',
        },
      },
    },
    a11y: {
      element: '#storybook-root',
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'label', enabled: true },
          { id: 'button-name', enabled: true },
        ],
      },
    },
  },
};

export default preview;

