import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import Pricing from './Pricing';

const meta = {
  component: Pricing,
  tags: ['ai-generated'],
} satisfies Meta<typeof Pricing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    // the Pro card's Annual switch starts on and flips
    const annual = canvas.getByRole('switch');
    await expect(annual).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(annual);
    await expect(annual).toHaveAttribute('aria-checked', 'false');
  },
};

// below md the three plans stack
export const Mobile: Story = { globals: { viewport: { value: 'mobile2', isRotated: false } } };

export const CssCheck: Story = {
  play: async ({ canvas }) => {
    // The Pro button is bg-[#4362BA] — fails if Tailwind / globals.css did not load.
    const pro = canvas.getByRole('button', { name: 'Start with Pro' });
    await expect(getComputedStyle(pro).backgroundColor).toBe('rgb(67, 98, 186)');
  },
};
