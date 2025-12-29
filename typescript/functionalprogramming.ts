// Functional
// Immutable data
const data = Object.freeze([1, 2, 3, 4, 5, 6]);

// data will likely change so you'll have to pass functions as 
// arguments to other functions

const addEmoji = (val) => toString(val) + ' ☢ ';
const emojiData = data.map(addEmoji);
console.log(emojiData);

// Functions as a return value
const appendEmoji = (fixed) => (dynamic) => fixed + dynamic;

const rain = appendEmoji(' 🌧 ');
const sun = appendEmoji(' ☀ ');

console.log(rain(' today'));
console.log(sun(' tomorrow'));
