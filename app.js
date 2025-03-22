const age = 25;

if (age < 13) {
    console.log('Child');
} else if (age >= 13 && age < 20) {
    console.log('Teenager');
} else if (age >= 20 && age < 65) {
    console.log('Adult');
} else {
    console.log('Senior');
}

// Javascript can run on browsers

// VS NODEJS // node app.js


// const dayNumber = 3;
// let dayName;

// if (dayNumber === 1) {
//     dayName = 'Monday';
// } else if (dayNumber === 2) {
//     dayName = 'Tuesday';
// } else if (dayNumber === 3) {
//     dayName = 'Wednesday'; // assignment
// } else if (dayNumber === 4) {
//     dayName = 'Thursday';
// } else if (dayNumber === 5) {
//     dayName = 'Friday';
// } else if (dayNumber === 6) {
//     dayName = 'Saturday';
// } else if (dayNumber === 7) {
//     dayName = 'Sunday';
// } else {
//     dayName = 'Invalid day number';
// }

// console.log(`Day ${dayNumber} is ${dayName}.`);

// Javascript can run on browsers

// const name = "Nishanth"; // ctrl + /
// const profession = "Software Engineer";

// console.log(name + profession)


const dayNumber = 3;
let dayName;

switch(dayNumber) {
    case 1:
        dayName = 'Monday';
        break;
    case 2:
        dayName = 'Tuesday';
        break;
    case 3:
        dayName = 'Wednesday';
        break;
    case 4:
        dayName = 'Thursday';
        break;
    case 5:
        dayName = 'Friday';
        break;
    case 6:
        dayName = 'Saturday';
        break;
    case 7:
        dayName = 'Sunday';
        break;
    default:
        dayName = 'Invalid day number';
}

console.log(`Day ${dayNumber} is ${dayName}.`);


const operator = '*';
const num1 = 10;
const num2 = 5;
let result;

if (operator === '+') {
    result = num1 + num2;
} else if (operator === '-') {
    result = num1 - num2;
} else if (operator === '*') {
    result = num1 * num2;
} else if (operator === '/') {
    result = num1 / num2;
} else {
    result = 'Invalid operator';
}

console.log(`Result: ${result}`);


// const operator = '+';
// const num1 = 10;
// const num2 = 5;
// let result;

// switch (operator) {
//     case '+':
//         result = num1 + num2;
//         break;
//     case '-':
//         result = num1 - num2;
//         break;
//     case '*':
//         result = num1 * num2;
//         break;
//     case '/':
//         result = num1 / num2;
//         break;
//     default:
//         result = 'Invalid operator';
// }

// console.log(`Result: ${result}`);

// const lightColor = 'yellow';

// if (lightColor === 'green') {
//     console.log('Go!');
// }