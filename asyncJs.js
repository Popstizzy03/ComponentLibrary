// Async JavaScript
console.log("1")

new Promise((resolve, reject) => {
  resolve();
}).then(() => {
  console.log("2");
});

setTimeout(() => {
console.log("3");
}, 0);

console.log("4");
/**
Result: rabboni_kabongo@penguin:~/learn$ bun run asyncJs.js 
1
4
2
3
*/
