// 10, 5 // bananas and apple // data
// i have 10 bananas and 5 apple // information

// Javascript we want to be able to create that data and then recall it over and over again. 
// To do this, we use what are called variables & constants

// Var & let & const
// var is the old way of defining variables in JavaScript.
// let is the new way of defining variables in JavaScript.
// const is the new way of defining constants in JavaScript.

// mutable variables
// Meaning they can be changed. We can do this by reassigning them a new value using the assignment operator (=)
// let name = "John";
// name = "Jane";

let age = 20;
age = 21;
console.log(age)

// immutable variables
// Meaning they cannot be changed. Once a constant is assigned a value, it cannot be reassigned a new value.

// const name = "John";
// name = "Jane"; // Error: Assignment to constant variable.

const pie = 3.14;
// pie = 42 // Error: Assignment to constant variable.

// Variables can be declared without assigning a value to them.
let name1; // declaring a variable
name1 = "John"; // assigning a value to a variable
// This is called declaring and initializing a variable.
let name2 = "abc"


// Variable names can contain letters, digits, underscores, and dollar signs.
// They cannot start with a digit.
// They cannot contain spaces or special characters.
// They cannot be reserved words.
// They are case-sensitive.
// They should be descriptive.
// They should be camelCase.

var userAge = 16;
// let user age = 16
// let x&yield = 10; // Error: Unexpected token '&'
let userEmailId = 10;

// -----------------------------var-----------------------------------
// Block scope variables

var greeter = "hay hi";
var times = 4;

if(times > 3) { // true
    var greeter = "say hello instead";
}

console.log(greeter); // say hello instead

// --------------------------let--------------------------------------
let greeter1 = "hay hi"; // global scope
let times1 = 4;

if(times > 3) { // true 
    let greeter1 = "say hello instead"; // block scope variable
    console.log(greeter1); // say hello instead
}

console.log(greeter1); // hay hi