import {animate, animateChild, query, stagger, state, style, transition, trigger} from '@angular/animations';

export const openClose = trigger('openClose', [
  state('true', style({opacity: 1, transform: 'translateY(0)', visibility: 'visible'})),
  state('false', style({opacity: 0, transform: 'translateY(10px)', visibility: 'hidden'})),
  transition('false <=> true', animate('400ms cubic-bezier(0.68,-1.55,0.27,2.55)'))
]);

export const openClose2 = trigger('openClose2', [
  state('false', style({transform: 'translateY(0)'})),
  state('true', style({transform: 'translateY(15px)'})),
  transition('* <=> *', animate('350ms cubic-bezier(0.68,-1.55,0.27,2.55)'))
]);

export const openClose3 = trigger('openClose3', [
  state('true', style({height: '0'})),
  state('false', style({height: '100%'})),
  transition('* <=> *', animate('350ms cubic-bezier(0.68,-0.55,0.27,1.55)'))
]);


export const queryShake = trigger('queryShake', [
  transition('false => true', [
    query('@*', stagger('-60ms', [
      animateChild()
    ]), {optional: true}),
  ]),
  transition('true => false', [
    query('@*', stagger('60ms', [
      animateChild()
    ]), {optional: true}),
  ]),
]);
