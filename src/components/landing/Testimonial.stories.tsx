import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import Testimonial from './Testimonial';

const meta = {
  component: Testimonial,
  tags: ['ai-generated'],
} satisfies Meta<typeof Testimonial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    // "Next" slides the card track one step
    const track = canvasElement.querySelector('article')?.parentElement;
    const before = track?.style.transform;
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(track?.style.transform).not.toBe(before);
  },
};

// a phone shows one card at 84% of the column, the next peeking
export const Mobile: Story = { globals: { viewport: { value: 'mobile2', isRotated: false } } };
