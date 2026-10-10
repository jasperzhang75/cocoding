import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Infrastructure from './Infrastructure';

const meta = {
  component: Infrastructure,
  tags: ['ai-generated'],
} satisfies Meta<typeof Infrastructure>;

export default meta;
type Story = StoryObj<typeof meta>;

// The scroll-driven section: scroll the canvas to walk stages 1-3, then the
// held frames 4, 5, 6 and 8 (wheel on pointer devices, scroll bands on touch).
export const Default: Story = {};

export const Tablet: Story = { globals: { viewport: { value: 'tablet', isRotated: false } } };
