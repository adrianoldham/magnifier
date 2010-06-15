/** 
 * Easing Equations for Script.aculo.us
 * @author Brian Crescimanno <brian.crescimanno@gmail.com>
 * @version 0.8.1
 * @revised November 20, 2008
 * @copyright 2008 Brian Crescimanno, all rights reserved
 *
 * Released under terms of the BSD License
 * http://www.opensource.org/licenses/bsd-license.php
 *
 * The math for these equations was created by Robert Penner
 * http://www.robertpenner.com/profmx
 * 
 * -----------------------------------------------------------------------------------------
 * Do not remove any comments above this line, below comments may be removed to save space.
 *
 * An adaptation of Robert Penner's "easing equations" as seen in many Flash animations for 
 * Script.aculo.us 1.8.  One of my great pains in working with Script.aculo.us over other
 * libraries was the lack of these easing equations so I set about to port as many of the
 * equations as I could. 
 *
 * Imlements from Penner's equations:
 * 		Quadratic
 * 		Cubic
 * 		Quartic
 * 		Quintic
 * 		Sinusoidal
 *		Exponential
 *		Circular
 * 		Bounce (easeOut only)
 * 		Back
 *
 * Does not implement (yet)
 * 		Elastic		
 *		Bounce (easeIn, easeInOut)
 *
 * Ken Snyder provided a few reference implementations of Penner equations for 
 * Script.aculo.us; these reference implementations aided my work in porting a
 * (more) complete set.
 *
 */
 
 
/****** Quadratic ******/

Effect.Transitions.easeInQuad = function(pos){
	return Math.pow(pos, 2);
}

Effect.Transitions.easeOutQuad = function(pos){
	return -(Math.pow((pos-1), 2) -1);
}

Effect.Transitions.easeInOutQuad = function(pos){
	if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,2);
    return -0.5 * ((pos-=2)*pos - 2); 
}


/****** Cubic ******/

Effect.Transitions.easeInCubic = function(pos){
	return Math.pow(pos, 3);
}

Effect.Transitions.easeOutCubic = function(pos){
	return (Math.pow((pos-1), 3) +1);
}

Effect.Transitions.easeInOutCubic = function(pos){
	if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,3);
    return 0.5 * (Math.pow((pos-2),3) + 2); 	
}


/****** Quartic ******/

Effect.Transitions.easeInQuart = function(pos){
	return Math.pow(pos, 4);
}

Effect.Transitions.easeOutQuart = function(pos){
	return -(Math.pow((pos-1), 4) -1)
}

Effect.Transitions.easeInOutQuart = function(pos){
	if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,4);
    return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2); 
}


/****** Quintic ******/

Effect.Transitions.easeInQuint = function(pos){
	return Math.pow(pos, 5);
}

Effect.Transitions.easeOutQuint = function(pos){
	return (Math.pow((pos-1), 5) +1);
}

Effect.Transitions.easeInOutQuint = function(pos){
	if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,5);
    return 0.5 * (Math.pow((pos-2),5) + 2); 	
}


/****** Sinusoidal ******/

Effect.Transitions.easeInSine = function(pos){
	return -Math.cos(pos * (Math.PI/2)) + 1;
}

Effect.Transitions.easeOutSine = function(pos){
	return Math.sin(pos * (Math.PI/2));
}

Effect.Transitions.easeInOutSine = function(pos){
	return (-.5 * (Math.cos(Math.PI*pos) -1));
}


/****** Exponential ******/

Effect.Transitions.easeInExpo = function(pos){
	return (pos==0) ? 0 : Math.pow(2, 10 * (pos - 1));
}

Effect.Transitions.easeOutExpo = function(pos){
	return (pos==1) ? 1 : -Math.pow(2, -10 * pos) + 1;
}

Effect.Transitions.easeInOutExpo = function(pos){
	if(pos==0) return 0;
	if(pos==1) return 1;
	if((pos/=0.5) < 1) return 0.5 * Math.pow(2,10 * (pos-1));
	return 0.5 * (-Math.pow(2, -10 * --pos) + 2);	
}


/****** Circular ******/

Effect.Transitions.easeInCirc = function(pos){
	return -(Math.sqrt(1 - (pos*pos)) - 1);
}

Effect.Transitions.easeOutCirc = function(pos){
	return Math.sqrt(1 - Math.pow((pos-1), 2))
}

Effect.Transitions.easeInOutCirc = function(pos){
	if((pos/=0.5) < 1) return -0.5 * (Math.sqrt(1 - pos*pos) - 1);
	return 0.5 * (Math.sqrt(1 - (pos-=2)*pos) + 1);	
}


/****** Bounce ******/

Effect.Transitions.easeInBounce = function(pos){
	return 1;
}

Effect.Transitions.easeOutBounce = function(pos){
	if ((pos) < (1/2.75)) {
		return (7.5625*pos*pos);
	} else if (pos < (2/2.75)) {
		return (7.5625*(pos-=(1.5/2.75))*pos + .75);
	} else if (pos < (2.5/2.75)) {
		return (7.5625*(pos-=(2.25/2.75))*pos + .9375);
	} else {
		return (7.5625*(pos-=(2.625/2.75))*pos + .984375);
	}
}

Effect.Transitions.easeInOutBounce = function(pos){
	return 1;
}

/****** Back ******/

Effect.Transitions.easeInBack = function(pos){
	var s = 1.70158;	
	return (pos)*pos*((s+1)*pos - s);
}

Effect.Transitions.easeOutBack = function(pos){
	var s = 1.70158;	
	return (pos=pos-1)*pos*((s+1)*pos + s) + 1;
}

Effect.Transitions.easeInOutBack = function(pos){
	var s = 1.70158;	
	if((pos/=0.5) < 1) return 0.5*(pos*pos*(((s*=(1.525))+1)*pos -s));
	return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos +s) +2);
}

/****** Elastic ******/

Effect.Transitions.easeInElastic = function(pos){
	return 1;
}

Effect.Transitions.easeOutElastic = function(pos){
	return 1;
}

Effect.Transitions.easeInOutElastic = function(pos){
	return 1;
}



