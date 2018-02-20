import classie from 'classie';
import 'bootstrap/dist/css/bootstrap';
import 'font-awesome/css/font-awesome';
import '../css/animate';
import '../css/landing';
import 'common';

init();

var OnePageNav = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;
    this.metadata = this.$elem.data('plugin-options');
    this.$win = $(window);
    this.sections = {};
    this.didScroll = false;
    this.$doc = $(document);
    this.docHeight = this.$doc.height();
};

// the plugin prototype
OnePageNav.prototype = {
    defaults: {
        navItems: 'a',
        currentClass: 'current',
        changeHash: false,
        easing: 'swing',
        filter: '',
        scrollSpeed: 750,
        scrollThreshold: 0.5,
        begin: false,
        end: false,
        scrollChange: false
    },

    init: function() {
        // Introduce defaults that can be extended either
        // globally or using an object literal.
        this.config = $.extend({}, this.defaults, this.options, this.metadata);

        this.$nav = this.$elem.find(this.config.navItems);

        //Filter any links out of the nav
        if (this.config.filter !== '') {
            this.$nav = this.$nav.filter(this.config.filter);
        }

        //Handle clicks on the nav
        this.$nav.on('click.onePageNav', $.proxy(this.handleClick, this));

        //Get the section positions
        this.getPositions();

        //Handle scroll changes
        this.bindInterval();

        //Update the positions on resize too
        this.$win.on('resize.onePageNav', $.proxy(this.getPositions, this));

        return this;
    },

    adjustNav: function(self, $parent) {
        self.$elem.find('.' + self.config.currentClass).removeClass(self.config.currentClass);
        $parent.addClass(self.config.currentClass);
    },

    bindInterval: function() {
        var self = this;
        var docHeight;

        self.$win.on('scroll.onePageNav', function() {
            self.didScroll = true;
        });

        self.t = setInterval(function() {
            docHeight = self.$doc.height();

            //If it was scrolled
            if (self.didScroll) {
                self.didScroll = false;
                self.scrollChange();
            }

            //If the document height changes
            if (docHeight !== self.docHeight) {
                self.docHeight = docHeight;
                self.getPositions();
            }
        }, 250);
    },

    getHash: function($link) {
        return $link.attr('href').split('#')[1];
    },

    getPositions: function() {
        var self = this;
        var linkHref;
        var topPos;
        var $target;

        self.$nav.each(function() {
            linkHref = self.getHash($(this));
            $target = $('#' + linkHref);

            if ($target.length) {
                topPos = $target.offset().top;
                self.sections[linkHref] = Math.round(topPos);
            }
        });
    },

    getSection: function(windowPos) {
        var returnValue = null;
        var windowHeight = Math.round(this.$win.height() * this.config.scrollThreshold);

        for (var section in this.sections) {
            if (this.sections[section] - windowHeight < windowPos) {
                returnValue = section;
            }
        }

        return returnValue;
    },

    handleClick: function(e) {
        var self = this;
        var $link = $(e.currentTarget);
        var $parent = $link.parent();
        var newLoc = '#' + self.getHash($link);

        if (!$parent.hasClass(self.config.currentClass)) {
            //Start callback
            if (self.config.begin) {
                self.config.begin();
            }

            //Change the highlighted nav item
            self.adjustNav(self, $parent);

            //Removing the auto-adjust on scroll
            self.unbindInterval();

            //Scroll to the correct position
            self.scrollTo(newLoc, function() {
                //Do we need to change the hash?
                if (self.config.changeHash) {
                    window.location.hash = newLoc;
                }

                //Add the auto-adjust on scroll back in
                self.bindInterval();

                //End callback
                if (self.config.end) {
                    self.config.end();
                }
            });
        }

        e.preventDefault();
    },

    scrollChange: function() {
        var windowTop = this.$win.scrollTop();
        var position = this.getSection(windowTop);
        var $parent;

        //If the position is set
        if (position !== null) {
            $parent = this.$elem.find('a[href$="#' + position + '"]').parent();

            //If it's not already the current section
            if (!$parent.hasClass(this.config.currentClass)) {
                //Change the highlighted nav item
                this.adjustNav(this, $parent);

                //If there is a scrollChange callback
                if (this.config.scrollChange) {
                    this.config.scrollChange($parent);
                }
            }
        }
    },

    scrollTo: function(target, callback) {
        var offset = $(target).offset().top;

        $('html, body').animate({
            scrollTop: offset
        }, this.config.scrollSpeed, this.config.easing, callback);
    },

    unbindInterval: function() {
        clearInterval(this.t);
        this.$win.unbind('scroll.onePageNav');
    }
};

OnePageNav.defaults = OnePageNav.prototype.defaults;

$.fn.onePageNav = function(options) {
    return this.each(function() {
        new OnePageNav(this, options).init();
    });
};

/* =================================
        LOADER
    =================================== */
// makes sure the whole site is loaded
$(window).on('load', function() {
    // will first fade out the loading animation
    $('.status').fadeOut();
    // will fade out the whole DIV that covers the website.
    $('.preloader').fadeOut('slow');
});

$(document).ready(function() {
    $('.main-navigation').onePageNav({
        scrollThreshold: 0.2, // Adjust if Navigation highlights too early or too late
        filter: ':not(.external)',
        changeHash: true
    });
});


/* COLLAPSE NAVIGATION ON MOBILE AFTER CLICKING ON LINK - ADDED ON V1.5*/

if (matchMedia('(max-width: 480px)').matches) {
    $('.main-navigation a').on('click', function() {
        $('.navbar-toggle').click();
    });
}

/* NAVIGATION VISIBLE ON SCROLL */
if (matchMedia('(min-width: 992px), (max-width: 767px)').matches) {
    function mainNav() {
        var top = document.documentElement && document.documentElement.scrollTop || document.body.scrollTop;

        if (top > 40) {
            $('.sticky-navigation').stop().animate({
                'top': '0'
            });
        } else {
            $('.sticky-navigation').stop().animate({
                'top': '-60'
            });
        }
    }
}

if (matchMedia('(min-width: 768px) and (max-width: 991px)').matches) {
    function mainNav() {
        var top = document.documentElement && document.documentElement.scrollTop || document.body.scrollTop;

        if (top > 40) {
            $('.sticky-navigation').stop().animate({
                'top': '0'
            });
        } else {
            $('.sticky-navigation').stop().animate({
                'top': '-240'
            });
        }
    }
}

function mainNav() {}

$(document).ready(function() {
    mainNav();
});

$(window).scroll(function() {
    mainNav();
});


/* =================================
===  FULL SCREEN HEADER         ====
=================================== */
function alturaMaxima() {
    var altura = $(window).height();
    $('.full-screen').css('min-height', altura);

}

$(document).ready(function() {
    alturaMaxima();
    $(window).bind('resize', alturaMaxima);
});

/* =================================
===  SMOOTH SCROLL             ====
=================================== */
var scrollAnimationTime = 1200,
    scrollAnimation = 'easeInOutExpo';
$('a.scrollto').bind('click.smoothscroll', function(event) {
    event.preventDefault();
    var target = this.hash;
    $('html, body').stop().animate({
        'scrollTop': $(target).offset().top
    }, scrollAnimationTime, scrollAnimation, function() {
        window.location.hash = target;
    });
});

/* =================================
===  Bootstrap Internet Explorer 10 in Windows 8 and Windows Phone 8 FIX
=================================== */
if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
    var msViewportStyle = document.createElement('style')
    msViewportStyle.appendChild(
        document.createTextNode(
            '@-ms-viewport{width:auto!important}'
        )
    )
    document.querySelector('head').appendChild(msViewportStyle)
}

function init() {
    window.addEventListener('scroll', function() {
        var distanceY = window.pageYOffset || document.documentElement.scrollTop,
            shrinkOn = 300,
            header = document.querySelector('header');
        if (distanceY > shrinkOn) {
            classie.add(header, 'smaller');
        } else {
            if (classie.has(header, 'smaller')) {
                classie.remove(header, 'smaller');
            }
        }
    });
}
