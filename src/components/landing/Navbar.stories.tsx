import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import Navbar from './Navbar';

const meta = {
  component: Navbar,
  tags: ['ai-generated'],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // the mark and the name are the home link; the section links are in-page
    // anchors, Documents is the docs site
    await expect(canvas.getByRole('link', { name: /cocoding/i })).toHaveAttribute('href', '/');
    await expect(canvas.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '#pricing');
    await expect(canvas.getByRole('link', { name: 'Documents' })).toHaveAttribute('href', 'https://docs.cocoding.ai/');
  },
};

// below md the section links fold away; the mark and the two buttons stay
export const Mobile: Story = { globals: { viewport: { value: 'mobile2', isRotated: false } } };
