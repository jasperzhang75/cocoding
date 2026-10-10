import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import Hero from './Hero';

const meta = {
  component: Hero,
  tags: ['ai-generated'],
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Typing a prompt turns the voice chip into the send button (its glyph morphs with GSAP).
export const Typing: Story = {
  play: async ({ canvas, userEvent }) => {
    const chip = canvas.getByRole('button', { name: 'Voice input' });
    await userEvent.type(canvas.getByRole('textbox'), 'A furniture marketing website');
    await expect(chip).toHaveAccessibleName('Send');
  },
};

// the heading and the line under it wrap balanced on a phone
export const Mobile: Story = { globals: { viewport: { value: 'mobile2', isRotated: false } } };
