import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import MockDate from 'mockdate';
import { expect } from 'storybook/test';
import Features from './Features';

const meta = {
  component: Features,
  tags: ['ai-generated'],
} satisfies Meta<typeof Features>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// The security card's switch flips its state (on in the design).
export const SecurityToggle: Story = {
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('switch', { name: 'Toggle security' });
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  },
};

// The terminal card stamps its log lines with the viewer's date and clock, a minute
// apart. The clock is pinned for this story only: a frozen Date everywhere would
// also stop the page's time-based animations.
export const TerminalClock: Story = {
  beforeEach: () => {
    MockDate.set('2026-07-12T09:41:00');
    return () => MockDate.reset();
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Jul 12th 09:41')).toBeInTheDocument();
    await expect(canvas.getByText('Jul 12th 09:43')).toBeInTheDocument();
  },
};
