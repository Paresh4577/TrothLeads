// -----------------------------------------------------------------------------------------------------
// @ Fade in

import { animate, state, style, transition, trigger } from "@angular/animations";
import { GnxAnimationCurves, GnxAnimationDurations } from "./default-variables";

// -----------------------------------------------------------------------------------------------------
const fadeIn = trigger('fadeIn',
  [
    state('void',
      style({
            opacity: 0
      })
    ),
    state('*',
      style({
      opacity: 1
      })
    ),

    // Prevent the transition if the state is false
      transition('void => false', []),

      //Transition
    transition('void => *', animate('{{timings}}'),
      {
        params: {
          timings: `${GnxAnimationDurations.entering} ${GnxAnimationCurves.deceleration}`
      }
    })
  ])

  // -----------------------------------------------------------------------------------------------------
// @ Fade out
// -----------------------------------------------------------------------------------------------------
const fadeOut = trigger('fadeOut',
[
    state('*',
        style({
            opacity: 1
        })
    ),

    state('void',
        style({
            opacity: 0
        })
    ),

    // Prevent the transition if the state is false
    transition('false => void', []),

    // Transition
    transition('* => void', animate('{{timings}}'),
        {
            params: {
                timings: `${GnxAnimationDurations.exiting} ${GnxAnimationCurves.acceleration}`
            }
        }
    )
]
);


export { fadeIn, fadeOut };
