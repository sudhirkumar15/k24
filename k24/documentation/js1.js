Global var.
if a var not defined b4 it will gv Uncaught ReferenceError

In web pages the global object is window, so you can set and access global variables using the window.variable syntax.

Consequently, you can access global variables declared in one window or frame from another window or frame by specifying the window or frame name. For example, if a variable called phoneNumber is declared in a document, you can refer to this variable from an iframe as parent.phoneNumber.
_________________________________________
constant : 
You can create a read-only, named constant with the const keyword
Once a constant created then by that name you can not create another anything
for example ::: 
// THIS WILL CAUSE AN ERROR
function f() {};
const f = 5;

// THIS WILL CAUSE AN ERROR ALSO
function f() {
  const g = 5;
  var g;

  //statements
}

you can create a const obj also like below
const MY_OBJECT = {'key': 'value'};
MY_OBJECT.key = 'otherValue';
_____________________________________
Converting strings to numbers :::
parseInt() // after parsing it will return only a whole number
parseFloat() // this will parse as it is.
_____________________________________
Array :: 
var coffees = ['French Roast', 'Colombian', 'Kona'];
var fish = ['Lion', , 'Angel']; // fish[1] // undefined // but it wont create error.
_____________________________________


javascript object.

var die = {
	no:4,
	sq : function() {
		return this.size * this.size;
	}
}

die.no = 4; // giving default params to size
die.sq(); // Accessing sq function in die with this.
so this will refer  die as a class.
_________________________________________
In very normal make two file
calucation.js
area.js

so in area. js add
require('./calculation'); // no need of giving .js at end.
its equal to including that file and we can use the methods and properties of that file.
it has to use export in calculation page like export.cal = calculation; on other page cal var will be use to access calucation.
_____________________________________________________
var x = [1,2,3];
var y = x.map(x => x*2); //[2,4,6]

var words = ['spray', 'limit', 'elite', 'exuberant', 'destruction', 'present'];
const result = words.filter(word => word.length > 6);
console.log(result);
// expected output: Array ["exuberant", "destruction", "present"]

let iterable = [10, 20, 30];
for (let value of iterable) {
  value += 1;
  console.log(value);
}

let iterable = 'boo';
for (let value of iterable) {
  console.log(value);
}

_____________________________________
array function :: 
var x = [1,2,3];
var ages = [32, 33, 16, 4];
x.length // 3

var children = x.concat(ages); // children array has all recordes.

function checkAdult(age) {
    return age >= 18; 
}
ages.every(checkAdult); // it works as array_map in php
x.fill("Kiwi"); // x will be Kiwi, Kiwi, Kiwi
const result = ages.filter(word => word.length > 6);


function isBigEnough(element) {
  return element >= 15;
}
[12, 5, 8, 130, 44].find(isBigEnough); // 130 // same way findIndex but it will gv u index of that element in array






