import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { PARTNER_LOGOS } from '@/lib/trending-projects';
import LogoMarquee from './LogoMarquee';

const meta = {
  component: LogoMarquee,
  tags: ['ai-generated'],
} satisfies Meta<typeof LogoMarquee>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // The loop repeats the logo set many times over; every repeat is hidden from
    // assistive tech, so it reads each partner exactly once, by name.
    const named = canvas.getAllByRole('img');
    await expect(named.map((img) => img.getAttribute('alt'))).toEqual(PARTNER_LOGOS.map((logo) => logo.name));
  },
};
