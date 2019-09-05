const { notes, pitchClasses } = require('./notesAndQualities');

const noteToMidi = note => {
  return (
    notes[note.substring(0, note.length - 1)] +
    12 * (parseInt(note[note.length - 1]) + 2)
  );
};

const midiToNote = midi => {
  const pitchClass = midi % 12;
  const octave = Math.floor(midi / 12) - 2;
  const noteName = pitchClasses[pitchClass];
  // console.log(midi, `${noteName}` + `${octave}`);
  return `${noteName}` + `${octave}`;
};

const midiArrToNotes = midiArr => {
  return midiArr.sort((a, b) => a - b).map(note => midiToNote(note));
};

const noteArrToMidi = noteArr => {
  return noteArr.map(note => noteToMidi(note)).sort((a, b) => a - b);
};
// from chord:  [ 48, 72, 78, 80 ] [ 'C2', 'C4', 'Gb4', 'Ab4' ]
// to chord:  [ 48, 83, 72, 76 ] [ 'C2', 'C4', 'E4', 'B4' ]

// console.log(midiArrToNotes([48, 83, 72, 76]), 'expect', [
//   'C2',
//   'C4',
//   'E4',
//   'B4'
// ]);
// console.log(noteArrToMidi(['C2', 'C4', 'Gb4', 'Ab4']), 'expect', [
//   48,
//   72,
//   78,
//   80
// ]);
// console.log(noteToMidi('Eb3')); //expect 51
// console.log(noteToMidi('C3')); //expect 48

// console.log(midiToNote(51)); //expect Eb4
// console.log(midiToNote(48)); //expect C4

module.exports = { noteToMidi, midiToNote, midiArrToNotes, noteArrToMidi };
