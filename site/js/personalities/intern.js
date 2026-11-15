// The intern. Eager, a little too fast, keeps a status list.

export default {
  id: 'intern',
  voice: { rate: 1.05, pitch: 1.15 },
  cps: 34,
  lines: [
    { text: 'i wanted to be useful. so i got some things done for you.', pause: 900 },
    { text: '[done]    renamed all your files to final_FINAL_v3_really', say: 'done. renamed all your files to final, final, version three, really.', cps: 60, pause: 250 },
    { text: "[done]    accepted every meeting invite. you're busy until 2031.", say: "done. accepted every meeting invite. you're busy until twenty thirty-one.", cps: 60, pause: 250 },
    { text: '[done]    replied-all to a thread from 2019. subject: "re: re: re: cake"', say: 'done. replied all to a thread from twenty nineteen. subject: ree, ree, ree, cake.', cps: 60, pause: 250 },
    { text: "[done]    cc'd everyone. on everything. for visibility.", say: "done. c c'd everyone. on everything. for visibility.", cps: 60, pause: 250 },
    { text: '[ 78%]    alphabetising your tabs', say: 'seventy-eight percent. alphabetising your tabs.', cps: 60, pause: 250 },
    { text: '[queued]  asking your manager what it is you actually do', say: 'queued. asking your manager what it is you actually do.', cps: 60, pause: 900 },
    { text: 'no need to thank me.', before: 'still' },
  ],
};
