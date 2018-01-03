const MY_CONSTANT = "some-value"; // define a constant in js

var: 
if you make a var it will be access on full page and u can change its value anytime
Not : once a var is define from any where . .. it will be available any where in the page. it will be available in function clouser function and any where

ex :: 
var x = 1;
function test() {
	console.log(x);
}
test(); // 1
var y = function () {
	console.log(2 + x);
}
y(); //3
_____________________________________________
let : 
let is a block leve scop. means if a var is let then it wont b access out of scop

if (x == 1) {
	let y = 2;
}
console.log(y); // undefined

for (let i = 0; i < 10; i++) {
	//i will be here only.
}
console.log(i); // undefined
_____________________________________________
const :: 
Block scopping like a let keyword but const var value can never be change.
If you wanna change this value then it will gv error.
ex : 
const x = 10;
x = 11; // error Syntex error

:: you can not declare two samename var in block level scop
ex: 
if (x == 1) {
	let y = 2;
	let y = 3; // error
	var y = 4; //error
}
let x = 1;
if (true) {
	var x = 2;
}
console.log(x); // 2 // coz it is a block level and overriding the value.

const x = 2;
if (true) {
	x = 3;
	console.log(x); // error already defined.
}
_____________________________________________
Destructuring :: 
let x = 2;
let y = 3;
[x,y] = [3,4];  //in ryt array's first value will go to x and second value to y.
[x,y,z] = [2,3] // error [2,3,] // correct
can work for function return value also ex.
var test = function () {
	return [2,3];
}

[x,y] = test();

same way you can do for object also.
ex:
let doWork = function () {
	return {
		firstName : 'Sudhir',
		lastName  : 'Kumar',
		company   : 'Impelsys',
		handles   : {
			area : 'BTM'
		}
	}
}

let {
	firstName : first, 
	lastName, // if you are planning to have var name aslo same name then no need of giving second name. 
	handles : {
			area : areaOfLiving
		} 
	} = doWork(); // it works fine coz you are giving with key.


console.log(first); // Sudhir
console.log(lastName); // Kumar
console.log(areaOfLiving); // BTM


let doWork = function (url, {data, config}) {
	//data == test 
	//config == true 
}

let results = doWork('abcd.com', {
	data: 'test',
	config: true
});
_____________________________________________
Default params ::
var doWork = function(name) {
	return name || 'sudhir';
}

var doWork = function(name = 'sudhir') {
	return name;
}
doWork() // sudhir
doWork('') // undefine
doWork(undefined) // sudhir // if you pass undefine explicit then function will take default params.
_____________________________________________
rest params ::
let sum = function() {
	let result = 0;
	for (let i = 0; i < arguments.length; i++) {
		result += arguments[i]; // arguments is a default params which will take all parm of function
	}
}

sum(1,2,3,4);

let sum = function(name = '', ...number) {
	let res = 0;
	for (let i = 0; i < number.length; i++) {
		res += number[i];
	}
	or 
	number.forEach(function(n) {
		res += n;
	});
}

sum('sudhir', 1,2,3,4,5,6); 
sum('sudhir'); // here after sudhir 
//if you dont pass any it wont show error just number 
//will be an empty array in that function

function func(a = 55) { 
  console.log(arguments[0]);
  arguments[0] = 99;
}
func(); // undefined // if you r nt passing any params then arguments will undefine.
func(10);// 99 arguments[0] val got updated
_____________________________________________
Spread operator ::
let doWork = function(x,y,z) {
	return x + y + z;
}

doWork(...[1,2,3]);
var a = [3,4,5,6];
var b = [1,2, ...a,7,8] //[1,2,3,4,5,6,7,8];
_____________________________________________
Literals ::
this is use to string concatdination.
var url = "http://" + url + "/product/id/" + id;
var url = `http://${url}/product/id/${id}`;
var value = `${x} + ${y} is ${x+y}` // 3 + 4 is 7 // it will just concadinate
// the value instead of calculating it and {a+b} only this will calculate.
_____________________________________________
Class ::
class Employee {
	getName() {
		return 'Sudhir';
	}
}
var x = new Employee(); // here what ever params you pass it will go to constructor method.
_____________________________________________
constructor ::
class Employee {
	constructor(name) {
		this._name = name;
	}

	getName () {
		return this._name;
	}
}
var q = new Employee('Sudhir');
q.getName(); // Sudhir
_____________________________________________ 
Extra :: Utility functions.
We often have JavaScript functions which are used in several pages of our project. Best approach is to store all these functions in a shared JavaScript file, included when necessary.
function Util () {}
 
Util.read = function (sel) {
    return 1;
};
 
Util.write = function (sel, val) {
    return 2;
};
_____________________________________________
static ::
The static keyword defines a static method for a class. Static method calls are made directly on the class and are not callable on instances of the class
class StaticMethodCall {
  constructor() {
    // console.log(StaticMethodCall.staticMethod()); 
    this.constructor.staticMethod1(); // not work coz staticMethod1 is not a static function
    this.staticMethod1(); 
  }

  static staticMethod() {
    console.log('asdasdas');
    return 'static method has been called.';

  }

  static staticMethod2() {
  	this.staticMethod() // you can call from static to static by using this keyword.
  }

  staticMethod1() {
  	//call from non static to static like this way
    this.constructor.staticMethod(); // work
    StaticMethodCall.staticMethod();// work
    this.staticMethod(); // you can not call only by this keyword.
  }
}

var x = new StaticMethodCall();
x.staticMethod // error // u can not call static method by obj

class Triple {
  static triple(n) {
    if (n === undefined) {
      n = 1;
    }
    return n * 3;
  }
}

class BiggerTriple extends Triple {
  static triple(n) {
    return super.triple(n) * super.triple(n); // if you hv to call parent class static function then use super.
  }
}

_____________________________________________
Default function :: 
var x = (function() {
  return 22;
}());
console.log(x); // this will call by default.
_____________________________________________
Arrow function :: 
var adder = {
  base: 1,

  add: function(a) {
    var f = v => v + this.base; // base value can be tak like this
    return f(a);
  }
}
// Destructuring within the parameter list is also supported
let f = ([a, b] = [1, 2], {x: c} = {x: a + b}) => a + b + c;
f();
(param1, param2, ...rest) => { statements }

var arguments = [1, 2, 3];
var arr = () => arguments[0];
arr(); // 1 // arraw function does not have its own arguments

function foo(n) {
  var f = () => arguments[0] + n; // but this will have arguments
  return f(10);
}

foo(1); // 2
_____________________________________________




