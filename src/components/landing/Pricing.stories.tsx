import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import Pricing from './Pricing';

const meta = {
  component: Pricing,
  tags: ['ai-generated'],
} satisfies Meta<typeof Pricing>;

export default meta;
type Story = StoryObj<typeof meta>;

// the Pro card's price line ("$180/yr", "$18/mo + $32", ...)
const proPrice = (canvasElement: HTMLElement) =>
  canvasElement.querySelectorAll('article')[1].querySelectorAll('p')[1].textContent;

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    // Annual starts on and prices the year; off, the month
    const annual = canvas.getByRole('switch');
    await expect(annual).toHaveAttribute('aria-checked', 'true');
    await expect(proPrice(canvasElement)).toBe('$180/yr');
    await userEvent.click(annual);
    await expect(annual).toHaveAttribute('aria-checked', 'false');
    await expect(proPrice(canvasElement)).toBe('$18/mo');
  },
};

// A credit pack adds to the price; the menu's figures follow the billing period.
export const ExtraCredits: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: "I don't need extra credits" }));
    await userEvent.click(canvas.getByRole('option', { name: '200 credits - $320/yr' }));
    await expect(proPrice(canvasElement)).toBe('$180/yr + $320');
    await userEvent.click(canvas.getByRole('switch'));
    await expect(proPrice(canvasElement)).toBe('$18/mo + $32');
    await expect(canvas.getByRole('button', { name: '200 credits - $32/mo' })).toHaveAttribute('aria-expanded', 'false');
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
