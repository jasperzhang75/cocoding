import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor } from 'storybook/test';
import FinalCta from './FinalCta';

const meta = {
  component: FinalCta,
  tags: ['ai-generated'],
} satisfies Meta<typeof FinalCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // The Unicorn Studio scene host is there, hidden until the scene has
    // drawn (FinalCtaBackground); the heading and the button render over it.
    const host = canvasElement.querySelector('[data-unicorn]');
    await waitFor(() => expect(host).toBeInTheDocument());
    expect(canvasElement.querySelector('section')).toHaveTextContent('Build the future.');
  },
};
