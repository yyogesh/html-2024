let age = 18;

if(age < 18) { // true
    console.log("You are a minor");
    console.log("You cannot drive");
    console.log("You cannot vote");
} else if(age >= 18 && age < 65) { // true
    console.log("You are an adult");
    console.log("You can drive");
    console.log("You can vote");
} else {
    console.log("You are a senior citizen");
}


let grade = 85;

if (grade >= 90) {
    console.log("You got an A!");
} else if (grade >= 80) {
    console.log("You got a B.");
} else if (grade >= 70) {
    console.log("You got a C.");
} else if (grade >= 60) {
    console.log("You got a D.");
} else {
    console.log("You got an F.");
}


let day = "Friday";

switch (day) {
    case "Monday":
        console.log("Monday");
        break;
    case "Tuesday":
    case "Wednesday":
    case "Thursday":
        console.log("Midweek days");
        break;
    case "Friday":
        console.log("Last day of the workweek");
        break;
    case "Saturday":
    case "Sunday":
        console.log("Weekend!");
        break;
    default:
        console.log("Invalid day");
}



let month = "December";

switch (month) {
    case "December":
    case "January":
    case "February":
        console.log("It's winter.");
        break;
    case "March":
    case "April":
    case "May":
        console.log("It's spring.");
        break;
    case "June":
    case "July":
    case "August":
        console.log("It's summer.");
        break;
    case "September":
    case "October":
    case "November":
        console.log("It's autumn.");
        break;
    default:
        console.log("Invalid month.");
}