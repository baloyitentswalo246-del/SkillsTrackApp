Month 1 Formative Questions. 
----------------------------
1. Explain why the programming life cycle should be followed before coding begins.  

Following the life cycle provides structure and reduce risk. It also ensures that the problem is properly understood and planned
before writing code. Jumping straight into coding often leads to errors and time wasted that don't meet user needs. 

.....................................................................................................................................
2. List and explain the main steps of the programming life cycle. Your answer must show how each step 
contributes to the development of a working solution. 

A) Problem Analysis - Identify the problem, users and requirements. This will address the real need.

B) Design - Create wireframes, flowcharts, pseudocode and data structures. This will give clear plan before coding.

C) Coding/Implementation - Write the program using JavaScript and choosen tools by following the design guides.

D) Testing - Run the program, check for bugs and validate against requirements. This ensures correctness. 

E) Deployment - Release the program for actual use.

F) Maintenance/Improvement - Fix issues and add improvements over time.

.................................................................................................................................
3. Explain when const should be used instead of let. Also explain why var should normally be avoided in 
modern JavaScript. 

1 - Use const: when a variable's value should never change.

2 - Use let: when the value may change during execution.

3 - Avoid var: because it has function scope instead of block scope, which can cause unexpected behaviour and bugs in modern 
JavaScript

....................................................................................................................................
4. Explain how local and global scope can affect the reliability and maintainability of a JavaScript 
application.  

Local scope keeps variables restricted to a function or block, preventing accidental changes elsewhere. Global scope makes
variables accessible everywhere, but too many globals reduce reliability and make debugging harder. Using local scope
improves maintainability.

.....................................................................................................................................
5. Explain how map(), filter() and reduce() process an array of task objects differently. Provide one 
suitable use for each method. 

1 - map() - Transforms each item in an array and returns a new array. Example: converting task titles to uppercase.

2 - filter() - Returns only items that meet a condition. Example: selecting only completed tasks.

3 - reduce() - Combines all items into a single value. Example: calculating total hours spent on tasks.

.....................................................................................................................................

6. Explain why an application should use classes or structured objects instead of storing related 
information in several unrelated variables.  

Classes and objects group related data and behavior together, making code organized and reusable. For example, a Task class can store 
title, status, and hours insteadf of keeping seperate variables. this improves readability and reduce duplication. 


.......................................................................................................................................

7. Explain how branches, pull requests and automated checks reduce risk when developers collaborate 
on a project.  
 
A) - Branches isolate new features so they don't break the main code.

B) - Pull requests allow peer review before merging, catching mistakes early.

C) Automated checks linting/tests ensure code quality. Together, they prevent errors and improve collaboration.

......................................................................................................................................

8. Study the following values:
 
const userName = "Lerato"; 
const age = 22; 
const isActive = true; 
const selectedProject = null; 
Answer the following: 

a. State the data type of each value.  

A) - userName = "Lerato" → String age = 22 → Number isActive = true → Boolean selectedProject = null → Null
--------------------------------------------------------------------------------------------------------------

b. Explain how age could be converted from a number to a string. 

B) - Convert age to string: String(age) or age.toString().

------------------------------------------------------------------------------------------------------------------------

c. Explain what the typeof operator is used for. 

C) - typeof is used to check the data type of a value.

.....................................................................................................................................

9. Analyse the following code:
 
const total = "10" + 5; 
const looseComparison = 5 == "5"; 
const strictComparison = 5 === "5"; 
console.log(total); 
console.log(looseComparison); 
console.log(strictComparison);
 
Answer the following:

a. State the output of each console.log() statement.    

A) - Outputs;
             - console.log(total0 -> "105" (string)
             - console.log(looseComparison) -> true
             - console.log (strictComparison) -> false
-----------------------------------------------------------------------------------------------------

b. Explain why "10" + 5 does not produce the number 15. 

B) - "10" + 5 produces "105" because the string forces concatenation, not addition.

----------------------------------------------------------------------------------------------------

c. Explain the difference between == and ===. 

C) - == compares values loosely (perfoms type conversion). === compare both value and type strictly.

--------------------------------------------------------------------------------------------------------

d. Rewrite the first statement so that it produces the number 15. 

D) Rewrite to produce 15: const total = Number ("10") + 5;

........................................................................................................................................

10. Study the following functions:
 
function calculateTotal(price, quantity = 1) { 
return price * quantity; 
} 
const applyDiscount = (total, percentage) => { 
return total - total * (percentage / 100); 
}; 
const orderTotal = calculateTotal(150, 3); 
const finalTotal = applyDiscount(orderTotal, 10);
 
Answer the following:
 
a. Identify the parameters of calculateTotal(). 

A) Parameters: price, quantity
-----------------------------------------------------------------------------------------------------------

b. Explain the purpose of the default value assigned to quantity. 
 
B) Default value ensures quantity is 1 if not provided.

-------------------------------------------------------------------------------------------------------------

c. Explain what the return keyword does. 

C) return sends the results back to the caller.

----------------------------------------------------------------------------------------------------------

d. State the value stored in orderTotal. 

D) orderTotal = 450. 

-----------------------------------------------------------------------------------------------------------

e. State the value stored in finalTotal. 

E) finalTotal = 405.

----------------------------------------------------------------------------------------------------------

f. Explain one difference between a function declaration and an arrow function.

F) Difference: Function declarations are hoisted and can be called before they're defined;
   arrow functions are not hoisted and have lexical this.

.........................................................................................................................................

11. Study the following array: 

const tasks = [ 
{ title: "Create wireframes", completed: true, hours: 3 }, 
{ title: "Develop login form", completed: false, hours: 5 }, 
{ title: "Test application", completed: true, hours: 2 }, 
{ title: "Write documentation", completed: false, hours: 4 } 
];
 
Write JavaScript code that:  
 
a. Uses a loop to display the title of every task.

for (let task of tasks) {
  console.log(task.title);
}

-----------------------------------------------------------------------------------

b. Uses a conditional statement to display only completed tasks. 

for (let task of tasks) {
  if (task.completed) console.log(task.title);
}

-----------------------------------------------------------------------------------

c. Counts the number of completed tasks. 

const completedCount = tasks.filter(t => t.completed).length;

--------------------------------------------------------------------------------------

d. Calculates the total number of hours for all tasks. 

const totalHours = tasks.reduce((sum, t) => sum + t.hours, 0);

--------------------------------------------------------------------------------------

e. Displays an appropriate message if no tasks are available. 

if (tasks.length === 0) console.log("No tasks available");

..................................................................................................................................................

15. Study the following statement:
 
document.cookie = "theme=dark; max-age=3600; path=/"; 

Answer the following: 

a. Explain what information the cookie stores. 

Stores theme preference = "dark". 

---------------------------------------------------------------------------------

b. Explain the purpose of max-age=3600. 

max-age=3600 means the cookie expires after 1 hour. 

----------------------------------------------------------------------------------

c. Explain the purpose of path=/. 

path=/ means the cookie is available across the whole site.

----------------------------------------------------------------------------------

d. Write a JavaScript statement that displays the available cookies. 

console.log(document.cookie);

----------------------------------------------------------------------------------

16. A registration form contains the following fields:
 
• name;  
• email address;  
• password; and  
• age.  

Develop five test cases that could be used to test the form. Each test case must include: 

• the input or condition being tested; and  
• the expected result.  

Your test cases must include at least one valid submission, one missing value, one invalid email address and 
one boundary-value test.  

1 - Valid submission – Name: “Kamo”, Email: “kamo@email.com”, Password: “Pass123”, Age: 25 → Expected: Success.

2 - Missing value – Email left blank → Expected: Error message “Email required”.

3 - Invalid email – Email: “sam@com” → Expected: Error “Invalid email format”.

4 - Boundary value – Age = 0 → Expected: Error “Age must be greater than 0”.

5 - Boundary value – Age = 120 → Expected: Error “Age out of range”.

--------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------

Squad 6 - Kamohelo, Grace, Judith































