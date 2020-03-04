import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce' 

class StickyHeader {
  constructor() {
    this.siteHeader = document.querySelector(".site-header")
    this.pageSections = document.querySelectorAll(".page-section")
    this.browserHeight = window.innerHeight
    this.previousScrollY = window.scrollY
    this.events()
  }

  events() {
    window.addEventListener("scroll", throttle( () => this.runOnScroll(), 250))
    window.addEventListener("resize", debounce(() => {
      this.browserHeight = window.innerHeight
    }, 300))
  }

  runOnScroll() {
    this.determineScrollDirection()
    if ( window.scrollY > 60) {
      this.siteHeader.classList.add("site-header--dark")
    } else{
      this.siteHeader.classList.remove("site-header--dark")
    }

    this.pageSections.forEach(el => this.calcSection(el))
  }

  determineScrollDirection() {
    if (window.scrollY > this.previousScrollY) {
      this.scrollDirection = 'down'
    } else {
      this.scrollDirection = 'up'
    }
    this.previousScrollY = window.scrollY
  }


  calcSection(el) {
    /* check if el intersect the viewport */
    if (window.scrollY + this.browserHeight >el.offsetTop && window.scrollY < el.offsetTop + el.offsetHeight) {
      let scrollPercent = el.getBoundingClientRect().top / this.browserHeight * 100
      if ( (scrollPercent < 53 && scrollPercent > -50 && this.scrollDirection == 'down') || (scrollPercent < 33 && this.scrollDirection == 'up') ) {
        /*
        ---- Case 1 ----
        (scrollPercent < 53 && scrollPercent > -50 && this.scrollDirection == 'down')
        
        el to be colored is approaching from bottom to top 
        and is close enough to the top of the viewport.

        ---- Case 2 ----
        (scrollPercent < 33 && this.scrollDirection == 'up')
        
        There will be two els executing this block during the color transition:
        the leaving (lower) one and the incoming (upper) one.
        
        When the leaving one is not far enough from the top of the viewport (scrollPercent < 33),
        Even though the incoming one execute the following code to add class, 
        that will be soon removed by the leaving one due to the execution order.

        When the leaving one is not far enough from the top of the viewport (scrollPercent >= 33),
        The leaving one will not enter this code block, so only the incoming one add the class
        and remove others'.

        Leverage console.log(el.getAttribute("id") + ": " + scrollPercent) to observe.
        */
        
        let matchingLink = el.getAttribute("data-matching-link")
        document.querySelectorAll(`.primary-nav a:not(${matchingLink})`).forEach(el => el.classList.remove("is-current-link"))
        document.querySelector(matchingLink).classList.add("is-current-link")
      } else if ( el === this.pageSections[0] && scrollPercent > 60 && this.scrollDirection =='up') {
        /*
        When scrolling up to the top, matchingLink in header should change to origin color.
        However, because the landing image part is not page section, which means it will not 
        remove the added class of others', thus a different threshold (e.q. scrollPercent > 60) 
        is set to determine the case.        
        */
        let matchingLink = el.getAttribute("data-matching-link")
        document.querySelector(`.primary-nav ${matchingLink}`).classList.remove("is-current-link")
      }
    }
  }
}
export default StickyHeader;