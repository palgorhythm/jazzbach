const { voiceLead } = require('./voiceLeading');

const t = [
  { from: ['C4', 'C6', 'Gb6', 'Ab6', 'C7'], to: 'CM7' },
  { from: ['C4', 'C6', 'Gb6', 'Ab6'], to: 'CM7' },
  { from: ['C4', 'E6', 'Gb6', 'Ab6', 'D7'], to: 'Abm7' }
];

const runTests = tests => {
  console.log('-------------------------------------------');
  tests.forEach(test => {
    voiceLead(test.from, test.to);
    console.log('-------------------------------------------');
  });
};

runTests(t);
