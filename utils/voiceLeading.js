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

var resetVL;
let numUpperVoices = 4;
bassRange = [48, 1]; //beginning of range and number of octaves
upperNoteRange = [72, 2];
prevChord = [];
var currentScale = [];

function voiceLead(fromChord, toChord) {
  numUpperVoices = fromChord.length - 1;
  let chordRoot;
  let chordQuality;
  if (toChord[1] == 'b' || toChord[1] == '#') {
    chordRoot = toChord.slice(0, 2);
    chordQuality = toChord.slice(2);
  } else {
    chordRoot = toChord[0];
    chordQuality = toChord.slice(1);
  }
  currentScale = [];
  var upperNotes = [];
  let chord = [];
  var chordRootNum = notes[chordRoot];
  var bassNote = trans2octaveInRange(chordRootNum, bassRange[0], bassRange[1]);
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

  // var randy = rand(3, 6);
  // upperNotes = chordQualities[chordQuality].slice(0, randy);
  var toPitchClasses = [];
  for (var i = 0; i < upperNotes.length; i++) {
    var noteRelativeToRoot = chordRootNum + upperNotes[i];
    if (noteRelativeToRoot >= 12) {
      noteRelativeToRoot -= 12;
    }
    toPitchClasses.push(noteRelativeToRoot);
  }

  // console.log(toPitchClasses, upperNotes);

  // if (Math.random() > 1) {
  //   resetVL = 1;
  // }

  if (resetVL === 1) {
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
    // toPitchClasses = [4, 7, 11, 2]; //! we're forcing this just for now to avoid randomness for testing!
    chord = nearestChord(noteArrToMidi(fromChord), toPitchClasses);
  }

  chord.unshift(bassNote);
  console.log('from chord: ', fromChord);
  console.log('to chord: ', midiArrToNotes(chord));
  var scaleIntervals = chordQualities[chordQuality];

  for (var i = 0; i < scaleIntervals.length; i++) {
    var noteRelativeToRoot = chordRootNum + scaleIntervals[i];
    if (noteRelativeToRoot >= 12) {
      noteRelativeToRoot = noteRelativeToRoot - 12;
    }
    currentScale.push(
      trans2octaveInRange(noteRelativeToRoot, upperNoteRange[0], 1)
    );
  }

  currentScale = numericalSort(currentScale);
}

function nearestChord(fromChord, toPitchClasses) {
  var octavesUp = [];
  var toChord = [];
  var pitchChoices = makeArray(toPitchClasses.length, octavesUp.length, 0);

  for (var i = 0; i < numUpperVoices; i++) {
    var octave = Math.floor(fromChord[i + 1] / 12);
    if (!(octavesUp.indexOf(octave) > -1)) {
      octavesUp.push(octave); //consider all octaves the pitches in fromChord are in.
    }
  }

  for (var i = 0; i < toPitchClasses.length; i++) {
    for (var j = 0; j < octavesUp.length; j++) {
      var temp = toPitchClasses[i] + 12 * octavesUp[j];

      if (
        temp > upperNoteRange[0] &&
        temp < upperNoteRange[0] + 12 * upperNoteRange[1]
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
  var lowestSum = 9999;
  // console.log(voiceChoices, octaveChoices);
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
        lowestSum = temp;
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

const tests = [
  { from: ['C4', 'C6', 'Gb6', 'Ab6', 'C7'], to: 'CM7' },
  { from: ['C4', 'C6', 'Gb6', 'Ab6'], to: 'CM7' }
];
const runTests = tests => {
  console.log('-------------------------------------------');
  test.forEach(test => {
    voiceLead(test.from, test.to);
    console.log('-------------------------------------------');
  });
};

module.exports = { voiceLead };

// main(['Eb7']);
// main(['F7']);

// const testFromChord = [53, 87, 92, 79, 94, 72];
// const testToPitchClasses = [8, 2, 0, 5, 7, 10];

// console.log(nearestChord(testFromChord, testToPitchClasses));
