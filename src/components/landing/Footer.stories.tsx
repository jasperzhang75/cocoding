import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Footer from './Footer';

const meta = {
  component: Footer,
  tags: ['ai-generated'],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

// The giant wordmark brightens as it scrolls into view; at the page's end a hard
// pull (wheel, or a drag on touch) lifts the footer to show its cut-off half.
export const Default: Story = {};

export const Mobile: Story = { globals: { viewport: { value: 'mobile2', isRotated: false } } };
