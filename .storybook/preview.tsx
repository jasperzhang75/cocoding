import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'
import { fontVariables } from '../src/app/fonts'

/* The app has no providers, no data fetching, no browser storage and no
   portals: what a page needs is the root layout's <html> — the three
   next/font variables (globals.css maps them to font-sans / font-mono),
   h-full and antialiased — and globals.css, which also paints the body's
   #010101 ground and primary text. Set once, as the layout does. */
document.documentElement.classList.add(...`${fontVariables} h-full antialiased`.split(' '))

const preview: Preview = {
  parameters: {
    // the components are full-bleed page sections, like the page renders them
    layout: 'fullscreen',

    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;