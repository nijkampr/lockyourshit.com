// The roommate. Fast, guilty, over-explaining.

const pause = (ms = 1000) => ({ text: '', pause: ms });

export default {
  id: 'roommate',
  voice: { rate: 1.12, pitch: 1.05 },
  cps: 38,
  lines: [
    { text: "ok. don't be mad.", pause: 300 },
    { text: 'i had a few tabs over.', pause: 300 },
    { text: 'we drank all the RAM. chrome had most of it, to be fair.', say: 'we drank all the ram. chrome had most of it, to be fair.', pause: 400 },
    { text: "someone's cursor is still asleep on the couch.", pause: 400 },
    { text: "the fan is loud because of what we did. i don't want to talk about it.", pause: 400 },
    { text: "i'll clean up.", pause: 300 },
    pause(400),
    { text: "i won't. but i said it, and that counts." },
  ],
};
