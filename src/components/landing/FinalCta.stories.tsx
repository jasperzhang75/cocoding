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
    // The blue glow comes up once 30% of the section is on screen: onArrival
    // marks the section, and .rise-on-arrival fades the glow in.
    const section = canvasElement.querySelector('section');
    await waitFor(() => expect(section).toHaveAttribute('data-arrived'));
  },
};
