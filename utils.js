const { midiToNote, noteToMidi } = require('./midiToNote');

//////////////////////PERMUTATION, HEAP'S METHOD/////////////////////////////////////////

const permute = permutation => {
  var length = permutation.length,
    result = [permutation.slice()],
    c = makeVector(length, 0),
    i = 1,
    k,
    p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
};

const permsWithRep = (array, resultLen) => {
  var holdingArr = [];
  var recursiveABC = function(singleSolution) {
    if (singleSolution.length >= resultLen) {
      holdingArr.push(singleSolution);
      return;
    }
    for (var i = 0; i < array.length; i++) {
      recursiveABC(singleSolution.concat([array[i]]));
    }
  };
  recursiveABC([]);
  return holdingArr;
};

// /////////////////////SUBSETS of LENGTH K////////////////////////
// const kSubsetPermutations = (set, k, partial) => {
//   if (!partial) partial = []; // set default value on first call
//   for (var element in set) {
//     if (k > 1) {
//       var set_copy = set.slice(); // slice() creates copy of array
//       set_copy.splice(element, 1); // splice() removes element from array
//       kSubsetPermutations(set_copy, k - 1, partial.concat([set[element]]));
//     } // a.concat(b) appends b to copy of a
//     else {
//       var temp = partial.concat([set[element]]);
//       permResult.push(temp);
//     }
//   }
// };

// const perms = (set, k) => {
//   kSubsetPermutations(set, k);
//   return permResult;
// };

function makeVector(length, val) {
  return Array.apply(null, Array(length)).map(Number.prototype.valueOf, val);
}

const range = n => {
  return Array.apply(null, Array(n)).map(function(_, i) {
    return i;
  });
};

const numericalSort = array => {
  return array.sort(function(a, b) {
    return a - b;
  });
};

const trans2octaveInRange = (x, lowBound, numOctaves) => {
  return x + lowBound + 12 * Math.round(Math.random() * (numOctaves - 1));
};

const makeArray = (m, n, val) => {
  var arr = [];
  for (i = 0; i < m; i++) {
    arr[i] = [];
    for (j = 0; j < n; j++) {
      arr[i][j] = val;
    }
  }
  return arr;
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateWeightedList(list, weight) {
  var weighted_list = [];

  // Loop over weights
  for (var i = 0; i < weight.length; i++) {
    var multiples = weight[i] * 100;

    // Loop over the list of items
    for (var j = 0; j < multiples; j++) {
      weighted_list.push(list[i]);
    }
  }

  return weighted_list;
}
///////////////////////////////////////////////////////////////

module.exports = {
  permute,
  permsWithRep,
  makeArray,
  trans2octaveInRange,
  numericalSort,
  range,
  rand,
  generateWeightedList
};
