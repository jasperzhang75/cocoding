import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import LogoMarquee from './LogoMarquee';

const meta = {
  component: LogoMarquee,
  tags: ['ai-generated'],
} satisfies Meta<typeof LogoMarquee>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    // The loop draws the logo row twice; the copy is aria-hidden, so assistive tech
    // reads each logo once: as many named images as logos in one row.
    const all = canvasElement.querySelectorAll('img');
    await expect(canvas.getAllByRole('img')).toHaveLength(all.length / 2);
  },
};
