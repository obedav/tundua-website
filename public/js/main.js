(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    // Initiate the wowjs
    new WOW().init();

    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').css('top', '0px');
        } else {
            $('.sticky-top').css('top', '-100px');
        }
    });
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });

    // Header carousel
    $(".header-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        items: 1,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });

    // Document ready - initialize all effects and functionality
    $(document).ready(function() {
        console.log("Document ready - initializing all effects");
        
        // IMPORTANT: Force list content to be visible immediately on page load
        $('.service-item ul.list-group').css({
            'max-height': '500px',
            'opacity': '1',
            'overflow': 'visible',
            'transition': 'none'
        });
        
        // Remove the hover handlers that are hiding content
        $('.service-item').off('mouseenter mouseleave');
        
        // Apply just the visual effects on hover without hiding content
        $('.service-item').hover(
            function() {
                $(this).css({
                    'transform': 'translateY(-5px)',
                    'box-shadow': '0 10px 20px rgba(0, 0, 0, 0.1)'
                });
            },
            function() {
                $(this).css({
                    'transform': 'translateY(0)',
                    'box-shadow': '0 0 15px rgba(0, 0, 0, 0.05)'
                });
            }
        );
        
        // Apply these styles to all service items with a slight delay to ensure they're applied
        setTimeout(function() {
            $('.service-item ul.list-group').css({
                'max-height': '500px',
                'opacity': '1', 
                'overflow': 'visible'
            });
        }, 100);
        
        try {
            // FIX FOR PRE-DEPARTURE SECTION CONTENT
            // Only run this code on the pre-departure services page
            if (window.location.href.includes('pre-departure') || 
                document.querySelector('.pre-departure-content') !== null) {
                console.log("Pre-departure page detected, checking for empty content box");
                
                // Check for the empty left box in Pre-Departure Support Program section
                const $leftBox = $(".col-md-6:first-child .service-item").filter(function() {
                    // Additional check to make sure we're on the pre-departure page
                    return $(this).closest('.pre-departure-content').length > 0 && 
                           ($(this).find('h4').length === 0 || $(this).text().trim() === '');
                });
                
                if ($leftBox.length) {
                    console.log("Found empty pre-departure box, adding content");
                    $leftBox.html(`
                        <div class="d-flex align-items-center mb-3">
                            <div class="service-icon flex-shrink-0 bg-primary rounded-circle me-3">
                                <i class="fa fa-users text-white"></i>
                            </div>
                            <h4 class="mb-0">Orientation Sessions</h4>
                        </div>
                        <p>
                            Our specialized pre-departure workshops cover essential topics including:
                        </p>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item bg-transparent px-0 py-1">
                                <i class="fa fa-check-circle text-primary me-2"></i> Host country culture and customs
                            </li>
                            <li class="list-group-item bg-transparent px-0 py-1">
                                <i class="fa fa-check-circle text-primary me-2"></i> Academic expectations
                            </li>
                            <li class="list-group-item bg-transparent px-0 py-1">
                                <i class="fa fa-check-circle text-primary me-2"></i> Weather and appropriate clothing
                            </li>
                            <li class="list-group-item bg-transparent px-0 py-1">
                                <i class="fa fa-check-circle text-primary me-2"></i> Transportation systems
                            </li>
                            <li class="list-group-item bg-transparent px-0 py-1">
                                <i class="fa fa-check-circle text-primary me-2"></i> Health and safety protocols
                            </li>
                        </ul>
                    `);
                    
                    // Make sure content is visible in the newly added box
                    $leftBox.find('ul.list-group').css({
                        'max-height': '500px',
                        'opacity': '1',
                        'overflow': 'visible'
                    });
                }
            }
            
            // DESTINATION ITEMS HOVER EFFECTS
            $('.destination-item').each(function() {
                console.log("Found destination item");
            });
            
            // Enhanced hover effect for destination items
            $('.destination-item').hover(
                function() {
                    console.log("Destination hover in");
                    $(this).addClass('active-hover');
                    $(this).find('.destination-overlay').css('opacity', '1');
                    $(this).find('.destination-overlay h5, .destination-overlay p').css({
                        'transform': 'translateY(0)',
                        'opacity': '1'
                    });
                },
                function() {
                    console.log("Destination hover out");
                    if (!$(this).hasClass('hover-locked')) {
                        $(this).removeClass('active-hover');
                        $(this).find('.destination-overlay').css('opacity', '0.7');
                        $(this).find('.destination-overlay h5, .destination-overlay p').css({
                            'transform': 'translateY(20px)',
                            'opacity': '0'
                        });
                    }
                }
            );
            
            // Add click functionality to lock destination hover state
            $('.destination-item').on('click', function(e) {
                console.log("Destination click");
                // Only prevent default if it's not a link
                if (!$(this).find('a').length || !$(e.target).closest('a').length) {
                    e.preventDefault();
                }
                
                $(this).toggleClass('hover-locked');
                
                if ($(this).hasClass('hover-locked')) {
                    $(this).find('.destination-overlay').css('opacity', '1');
                    $(this).find('.destination-overlay h5, .destination-overlay p').css({
                        'transform': 'translateY(0)',
                        'opacity': '1'
                    });
                } else if (!$(this).hasClass('active-hover')) {
                    $(this).find('.destination-overlay').css('opacity', '0.7');
                    $(this).find('.destination-overlay h5, .destination-overlay p').css({
                        'transform': 'translateY(20px)',
                        'opacity': '0'
                    });
                }
            });
            
            // WORKSHOP ITEMS HOVER EFFECT
            $('.bg-light .d-flex').each(function() {
                console.log("Found workshop item");
            });
            
            // Workshop items hover effect
            $('.bg-light .d-flex').hover(
                function() {
                    console.log("Workshop hover in");
                    $(this).css({
                        'background-color': 'rgba(24, 29, 56, 0.05)',
                        'transform': 'translateX(5px)'
                    });
                    // Make sure the span actually exists
                    if ($(this).find('.ms-3 span').length) {
                        $(this).find('.ms-3 span').css('max-height', '80px');
                    }
                },
                function() {
                    console.log("Workshop hover out");
                    $(this).css({
                        'background-color': 'transparent',
                        'transform': 'translateX(0)'
                    });
                    // FIXED: Keep content visible after hover
                    if ($(this).find('.ms-3 span').length) {
                        $(this).find('.ms-3 span').css('max-height', '80px');
                    }
                }
            );
            
            // Final check to ensure content is visible
            $('.service-item ul.list-group').css({
                'max-height': '500px !important',
                'opacity': '1 !important',
                'overflow': 'visible !important'
            });
            
            console.log("All hover effects initialized");
        } catch (e) {
            console.error("Error in hover effects:", e);
        }
    });

    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        margin: 24,
        dots: true,
        loop: true,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });
    
})(jQuery);