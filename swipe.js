width_translation = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('translation')

// if (window.width < 800) {
document.body.style.transform = `translateX(-${width_translation})`
document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

let xDown, yDown

getTouches = (evt) => evt.touches

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                

function handleTouchMove(evt) {
    if ( !xDown || !yDown ) {
        return;
    }

    let xUp = evt.touches[0].clientX;                                    
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        const swipe = width_translation * (xDiff > 0 ? -1 : 1)
        // if ( xDiff > 0 ) { // left swipe
        //     swipe *= -1
        // }                       
        document.body.style.transform = `translateX(${swipe})`
    /* reset values */
    }
    xDown = yDown = null;                                             
};
// }
