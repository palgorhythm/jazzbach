const {
  permute,
  permsWithRep,
  makeArray,
  trans2octaveInRange,
  numericalSort,
  range,
  rand,
  generateWeightedList
} = require('./utils');

const { chordQualities, notes } = require('./notesAndQualities');
const {
  midiToNote,
  noteToMidi,
  midiArrToNotes,
  noteArrToMidi
} = require('./midiToNote');

const nameToChord = (chordName, bassRange, numUpperVoices) => {
  let chordRoot;
  let chordQuality;

  if (chordName[1] == 'b' || chordName[1] == '#') {
    chordRoot = chordName.slice(0, 2);
    chordQuality = chordName.slice(2);
  } else {
    chordRoot = chordName[0];
    chordQuality = chordName.slice(1);
  }

  var upperNotes = [];
  const chordRootNum = notes[chordRoot];
  const bassNote = trans2octaveInRange(
    chordRootNum,
    bassRange[0],
    bassRange[1]
  );

  // console.log(chordQuality);
  var weights = [1.0, 1.0, 0.7, 0.5, 0.4, 0.1, 0.05];
  var weightedScaleNotes = generateWeightedList(
    chordQualities[chordQuality],
    weights
  );
  for (var i = 0; i < numUpperVoices; i++) {
    var random_num = rand(0, weightedScaleNotes.length - 1);
    upperNotes.push(weightedScaleNotes[random_num]);
    weightedScaleNotes = weightedScaleNotes.filter(function(a) {
      return a !== weightedScaleNotes[random_num];
    });
  }
  var toPitchClasses = [];
  for (var i = 0; i < upperNotes.length; i++) {
    var noteRelativeToRoot = chordRootNum + upperNotes[i];
    if (noteRelativeToRoot >= 12) {
      noteRelativeToRoot -= 12;
    }
    toPitchClasses.push(noteRelativeToRoot);
  }
  return { bassNote, toPitchClasses };
};

const genRandomChord = (
  chordName,
  bassRange,
  upperNoteRange,
  numUpperVoices
) => {
  const { bassNote, toPitchClasses } = nameToChord(
    chordName,
    bassRange,
    numUpperVoices
  );
  const upperVoices = toPitchClasses.map(pc => {
    const rand = Math.floor(Math.random() * upperNoteRange[1]);
    return 72 + rand * 12 + pc;
  });
  upperVoices.unshift(bassNote);
  return upperVoices;
};

function voiceLead(fC, toChord) {
  const resetVL = false;
  let numUpperVoices = 4;
  const bassRange = [48, 1]; //beginning of range and number of octaves
  const upperNoteRange = [72, 2];
  let fromChord = fC;
  if (typeof fC === 'string') {
    fromChord = genRandomChord(fC, bassRange, upperNoteRange, numUpperVoices);
  }
  console.log(fromChord);
  numUpperVoices = fromChord.length - 1;
  let chord = [];

  const { bassNote, toPitchClasses } = nameToChord(
    toChord,
    bassRange,
    numUpperVoices
  );

  if (resetVL) {
    for (var i = 0; i < toPitchClasses.length; i++) {
      var voice = trans2octaveInRange(
        toPitchClasses[i],
        upperNoteRange[0],
        upperNoteRange[1]
      );
      chord.push(voice);
    }
    resetVL = 0;
    soloTransp = 0;
  } else {
    chord = nearestChord(noteArrToMidi(fromChord), toPitchClasses);
  }
  chord.unshift(bassNote);
  return chord;
}

function nearestChord(fromChord, toPitchClasses) {
  // console.log('yaee', fromChord, toPitchClasses);
  var octavesUp = [];
  var toChord = [];
  var pitchChoices = makeArray(toPitchClasses.length, octavesUp.length, 0);
  const numUpperVoices = toPitchClasses.length;
  const upperNoteRange = [72, 2];
  for (var i = 0; i < numUpperVoices; i++) {
    var octave = Math.floor(fromChord[i + 1] / 12);
    if (!(octavesUp.indexOf(octave) > -1)) {
      octavesUp.push(octave); //consider all octaves the pitches in fromChord are in.
    }
  }
  for (var i = 0; i < toPitchClasses.length; i++) {
    for (var j = 0; j < octavesUp.length; j++) {
      const temp = toPitchClasses[i] + 12 * octavesUp[j];

      if (
        temp >= upperNoteRange[0] &&
        temp <= upperNoteRange[0] + 12 * upperNoteRange[1]
      ) {
        pitchChoices[i][j] = temp; //add all choices in different octaves
      } else if (temp < upperNoteRange[0]) {
        //if it's out of range
        pitchChoices[i][j] = temp + 12;
      } else if (temp > upperNoteRange[0] + 12 * upperNoteRange[1]) {
        pitchChoices[i][j] = temp - 12;
      }
    }
  }
  var voiceChoices = permute(range(pitchChoices.length), numUpperVoices); //ex. [0,1,2], [1,0,2],... no rep.
  var octaveChoices = permsWithRep(range(octavesUp.length), numUpperVoices); //ex. [0,5,0], [3,4,4], etc. rep ok. picks the octave
  //eventually, support different number of pitchChoices for each slot, by doing permsWithRep for
  //different numbers: i.e. choosing from 0,5, then 0,7, then 0,2 => [3,5,5] or [0,0,7] things like that
  var lowestDistVoiceIndex;
  var lowestDistOctaveIndex;
  let sumOfDists;
  var lowestSum = Infinity;
  for (var i = 0; i < voiceChoices.length; i++) {
    //loop thru all orders of pitch choices
    for (var j = 0; j < octaveChoices.length; j++) {
      //loop thru each of the choices [ex. 0,2,1]
      sumOfDists = 0;
      for (var k = 0; k < numUpperVoices; k++) {
        //now that we've chosen the set of voices and octaves, go from 0 to 2 (num voices)
        sumOfDists += Math.abs(
          fromChord[k + 1] -
            pitchChoices[voiceChoices[i][k]][octaveChoices[j][k]]
        );
      }
      if (sumOfDists < lowestSum) {
        lowestDistVoiceIndex = i;
        lowestDistOctaveIndex = j;
        var temp = sumOfDists;
      }
    }
  }
  // console.log('pitch choices', pitchChoices, lowestDistVoiceIndex);
  for (var i = 0; i < numUpperVoices; i++) {
    toChord.push(
      pitchChoices[voiceChoices[lowestDistVoiceIndex][i]][
        octaveChoices[lowestDistOctaveIndex][i]
      ]
    );
  }
  return toChord;
}
//* need to account for edge case where upper voices span more than an octave!!1
// const tests = [
//   { from: ['C2', 'C4', 'Gb4', 'Ab4', 'D5'], to: 'CM7' },
//   { from: ['C2', 'C4', 'Gb4', 'Ab4'], to: 'CM7' }
// ];

// const runTests = tests => {
//   console.log('-------------------------------------------');
//   tests.forEach(test => {
//     console.log('from chord: ', noteArrToMidi(test.from), test.from);
//     console.log(
//       'to chord: ',
//       voiceLead(test.from, test.to).sort((a, b) => a - b),
//       midiArrToNotes(voiceLead(test.from, test.to))
//     );
//     console.log('-------------------------------------------');
//   });
// };

// runTests(tests);

const chords = ['Dm7', 'G7', 'CM7'];
chords.reduce((acc, nextChord) => {
  const result = voiceLead(acc, nextChord);
  console.log(result);
  return result;
});
module.exports = { voiceLead };

// main(['Eb7']);
// main(['F7']);

// const testFromChord = [53, 87, 92, 79, 94, 72];
// const testToPitchClasses = [8, 2, 0, 5, 7, 10];

// console.log(nearestChord(testFromChord, testToPitchClasses));
