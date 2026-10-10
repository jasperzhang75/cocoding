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
    // The Pro card is bg-[#07080C] — fails if Tailwind / globals.css did not load.
    const pro = canvas.getByText('Pro', { exact: true }).closest('article');
    await expect(pro).not.toBeNull();
    await expect(getComputedStyle(pro as HTMLElement).backgroundColor).toBe('rgb(7, 8, 12)');
  },
};
