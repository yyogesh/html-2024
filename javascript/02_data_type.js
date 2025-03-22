// Numbers
let length = 16; // length is variable name and 16 is value and type of variable is number
let weight = 7.5; // Float

let integer = 42;
let float = 3.14;
let infinity = Infinity;
let nan = NaN; // Not-a-Number

console.log("length type is", typeof length);
console.log(`weight type is ${typeof(weight)}`);

// Strings
let name = "John"; // String can double quotes or single quotes or backticks
let color = "Red" 

let singleQuotes = 'Hello, World!';
let doubleQuotes = "Hello, World!";
let backticks = `Hello, ${singleQuotes}`; // Template literals

console.log(`color type is ${typeof(color)}`);

// Booleans
let isTrue = true;
let isFalse = false;

// Undefined

let undefinedVar;
console.log(undefinedVar); // undefined


// Bigint
let bigInt = 9007199254740991n;

// Null
let nullVar = null;

// Non-Primitive 
// ----------------------------------------
// type of object

// Object
// Collections of data broken down into comma-separated "key: value" pairs
const person = { 
    name: "John",
    age: 25,
    isMarried: false
}

// Array object: 
// Collections of data in any format separated by commas and enclosed in square brackets
const fruits = ["Apple", "Banana", "Cherry"]; 

// Array of objects
const people = [
    {name: "John", age: 25, isMarried: false},
    {name: "Jane", age: 30, isMarried: true}
]

// Date object:
const date = new Date('2002-01-02')

// we need to make sure data is the right type.
// let age = "16";
// let age1 = 16;



console.log(typeof 42); // "number"
console.log(typeof 'Hello'); // "string"
console.log(typeof true); // "boolean"
console.log(typeof undefined); // "undefined"
console.log(typeof null); // "object" (historical bug)
console.log(typeof {}); // "object"
console.log(typeof []); // "object"

console.log(typeof function() {}); // "function"
console.log(typeof Symbol('sym')); // "symbol"
console.log(typeof 9007199254740991n); // "bigint"