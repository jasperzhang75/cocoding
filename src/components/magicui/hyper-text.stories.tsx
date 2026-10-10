import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor } from 'storybook/test';
import { HyperText } from './hyper-text';

const meta = {
  component: HyperText,
  tags: ['ai-generated'],
  parameters: { layout: 'centered' },
  args: {
    as: 'p',
    children: 'Pricing',
    className: 'font-mono text-indicator uppercase text-accent',
  },
} satisfies Meta<typeof HyperText>;

export default meta;
type Story = StoryObj<typeof meta>;

// The section eyebrow as every section uses it: one scramble once in view, no hover re-scramble.
export const Eyebrow: Story = {
  args: { startOnView: true, delay: 400, duration: 800, animateOnHover: false },
  play: async ({ canvasElement, args }) => {
    // the letters settle on the children, upper-cased
    await waitFor(() => expect(canvasElement.textContent).toBe(String(args.children).toUpperCase()), {
      timeout: 3000,
    });
  },
};

export const OnMount: Story = { args: { children: 'Testimonial' } };

export const HoverToScramble: Story = { args: { children: 'Features', animateOnHover: true } };
