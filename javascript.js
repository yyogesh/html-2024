// The if-else statement is used to execute a block of code based on a condition.
// {

// }

// if (condition) {
//     // Code to execute if the condition is true
// } else {
//     // Code to execute if the condition is false
// }

let age = 18;

if (age >= 18) {
    console.log("You are an adult");
} else {
    console.log("You are a minor");
}

// Output: You are an adult

let number = 7;
if (number % 2 === 0) {
    console.log("The number is even ", number);
} else {
    console.log("The number is odd", number);
}

// Output: The number is odd 7

let a = 10, b = 20, c = 15;

if (a > b && a > c) {
    console.log("a is the largest.");
} else if (b > a && b > c) {
    console.log("b is the largest.");
} else {
    console.log("c is the largest.");
}


let year = 1700;

if (year % 4 === 0 && year % 100 !== 0) {
    console.log("leap year");
} else {
    console.log("Not a leap year");
}


// The switch statement is used to perform different actions based on different conditions. 
// //It is often used as an alternative to multiple if-else statements.


// switch (expression) {
//     case value1:
//       // Code to execute if expression === value1
//       break;
//     case value2:
//       // Code to execute if expression === value2
//       break;
//     default:
//       // Code to execute if no case matches
//   }

let day = "Monday";

switch (day) {
  case "Monday":
    console.log("Start of the workweek.");
    break;
  case "Friday":
    console.log("End of the workweek.");
    break;
  default:
    console.log("It's a regular day.");
}


function greet(name) {
    return "Hello, " + name;
}

let message = greet("John");
console.log(message);

console.log(greet("Nishant"));
console.log(greet("Ajay"));
console.log(greet("Rahul"));
console.log(greet("Ravi"));



function checkNumber(num) {
    if(num > 0) {
        return "Number is positive";
    } else if (num < 0) {
        return "Number is negative";
    } else {
        return "Number is zero";
    }
}

console.log(checkNumber(5));
console.log(checkNumber(-5));
console.log(checkNumber(0));


function calculateGrade(score) {
    let grade;
    if (score >= 90) {
      grade = "A";
    } else if (score >= 80) {
      grade = "B";
    } else if (score >= 70) {
      grade = "C";
    } else if (score >= 60) {
      grade = "D";
    } else {
      grade = "F";
    }
    return grade;
  }


  function displayRemarks(grade) {
    switch (grade) {
      case "A":
        return "Excellent!";
      case "B":
        return "Good job!";
      case "C":
        return "You can do better.";
      case "D":
        return "Needs improvement.";
      case "F":
        return "Failed.";
      default:
        return "Invalid grade.";
    }
  }


let score = 85;
let grade = calculateGrade(score);
let remarks = displayRemarks(grade);
console.log(`Grade: ${grade}, Remarks: ${remarks}`);


function greet(message) {
    console.log(message);
}

greet("Hello, World!");