const { notes, pitchClasses } = require('./notesAndQualities');

const noteToMidi = note => {
  return (
    notes[note.substring(0, note.length - 1)] +
    12 * (parseInt(note[note.length - 1]) + 1)
  );
};

const midiToNote = midi => {
  const pitchClass = midi % 12;
  const octave = Math.floor(midi / 12);
  const noteName = pitchClasses[pitchClass];
  return `${noteName}` + `${octave}`;
};

const midiArrToNotes = midiArr => {
  return midiArr.sort((a, b) => a - b).map(note => midiToNote(note));
};

const noteArrToMidi = noteArr => {
  return noteArr.map(note => noteToMidi(note)).sort((a, b) => a - b);
};

// console.log(noteToMidi('Eb3')); //expect 51
// console.log(noteToMidi('C3')); //expect 48

// console.log(midiToNote(51)); //expect Eb4
// console.log(midiToNote(48)); //expect C4

module.exports = { noteToMidi, midiToNote, midiArrToNotes, noteArrToMidi };
