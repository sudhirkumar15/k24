Forms :: 
______________________________
<button (click) = "changeText">  </button> {{txtC}}
DOM events carry a payload of information that may be useful to the component.

+++ Keyup ::
<input (keyup) = "onKeyUp($event)"></input> // in onKeyUp function in ts file u will get all info of this even
we can use these params using == event.target.value

The properties of an $event object vary depending on the type of DOM event. For example, a mouse event includes different information than a input box editing event
All standard DOM event objects have a target property

event.key :: this will give u which event happend.
data type of $event is  onKey(event: KeyboardEvent) { return true; }

main benigit of give data type for even is stopping to passing the entire DOM event into the method

+++ Reference variable :: 
<input #box (keyup)="0"><p>{{box.value}}</p>
in above box var contain all info of that input Element
Note: #box will never work if u dont bind it with any event.
So in above ex. input has been bing to keyup and give a return 0.
The template is completely self contained. It doesn't bind to the component, and the component does nothing

++++ event filtering :: 
<input #box (keyup.enter)="onEnter(box.value)"><p>{{value}}</p>
In above on keypress of enter inEnter event will call with box value and it will display in p ElementListTagNameMap.

<input #box (keyup.enter)="update(box.value)" (blur)="update(box.value)"> <p>{{value}}</p>
In above once press key update function will call with box value anf it will update in p tag and id u on blure also it updates.
________________________________________________
Template driven forms : 
we will learn two-way data binding, change tracking, validation, and error handling.
for any form to be work like ng form u have to add <form #heroForm="ngForm">

now u can track everything by ngModel.

There are total two to build form : 
template driven and reactive( model-driven form )
<input type="text" class="form-control" id="name"  required [(ngModel)]="model.name" name="name">
TODO: remove this: {{model.name}}

Track control state and validity with ngMode :: 
two way data binding is done by ngModel but it give in more detail in forms
ngModel also updates the control with special Angular CSS classes
classes names are : 
The control has been visited.
ng-touched, ng-untouched
The control's value has changed.
ng-dirty, ng-pristine
The control's value is valid.
ng-valid , ng-invalid
<input type="text" class="form-control" id="name" required  [(ngModel)]="model.name" name="name"
  #spy>
<br>TODO: remove this: {{spy.className}}

above all state classes can be get from #spy referance

Example : 
<input type="text" class="form-control" id="name1" required [(ngModel)]="model.name" name="name1" #spy>
<input type="text" class="form-control" id="name" required [(ngModel)]="model.name" name="name">

in above write in any input and it will show in other input value just has to give same name of model.

<label for="name">Name</label>
<input type="text" class="form-control" id="name" required [(ngModel)]="model.name" name="name"
       #name="ngModel">
<div [hidden]="name.valid || name.pristine" class="alert alert-danger">
  Name is required // in this example u can see the use of states.
</div>
<form (ngSubmit)="onSubmit()" #heroForm="ngForm"> // need to add ngSubmit also.
so in above example : u can cl onSubmit function and set value and based on that value u can do some operation in component
<button type="submit" class="btn btn-success" [disabled]="!heroForm.form.valid">Submit</button>
over all validity : If any of the form element are in that state . . over form evement will b in that state.

+++++++++++++ Form validation ++++++++++++++++







