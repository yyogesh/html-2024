// Numbers
let length = 16; // length is variable name and 16 is value and type of variable is number
let weight = 7.5; // Float

console.log("length type is", typeof length);
console.log(`weight type is ${typeof(weight)}`);

// Strings
let name = "John"; // String can double quotes or single quotes or backticks
let color = "Red" 

console.log(`color type is ${typeof(color)}`);

// Booleans
let isTrue = true;
let isFalse = false;

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