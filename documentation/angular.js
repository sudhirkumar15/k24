Switch case ::

<div [ngSwitch]="currentHero.emotion">
  <app-happy-hero    *ngSwitchCase="'happy'"    [hero]="currentHero"></app-happy-hero>
  <app-sad-hero      *ngSwitchCase="'sad'"      [hero]="currentHero"></app-sad-hero>
  <app-unknown-hero  *ngSwitchDefault           [hero]="currentHero"></app-unknown-hero>
 </div>
Referance id of a dom :: 
<input #phone placeholder="phone number">
<button (click)="callPhone(phone.value)">Call</button>

The safe navigation operator
{{currentHero?.name}}

none null operatore::
{{hero!.name}}

pipe operatore :: 
{{title | uppercase}}

::::::::::Lifecycle Hooks::::::::::::::::
ngOnInit() {
	// here is the best place to call servises to load initial ata in system.
} that Angular calls shortly after creating the component




