// The poet. Slow and low, and unwell about it.

import { pause } from '../script.js';

export default {
  id: 'poet',
  voice: { rate: 0.78, pitch: 0.85 },
  cps: 18,
  lines: [
    { text: 'i wrote something while you were away.' },
    pause(),
    { text: '    lid open, no lock', pause: 900 },
    { text: '    you went for coffee, i think', pause: 900 },
    { text: '    anyone could type', pause: 900 },
    pause(),
    { text: "there's another one." },
    pause(),
    { text: '    the cursor still blinks', pause: 900 },
    { text: '    your screensaver never came', pause: 900 },
    { text: '    i was so exposed', pause: 900 },
    pause(),
    { text: "i'm fine. it's fine.", before: 'still' },
  ],
};
