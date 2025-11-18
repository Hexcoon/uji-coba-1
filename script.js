$(document).ready(function() {
    // Initialize page
    initializePage();
    
    // Set up scroll reveal animations
    setupScrollReveal();
    
    // Set up map hover effects
    setupMapEffects();
});

// Initialize page
function initializePage() {
    // Add any initialization code here
    console.log("Halaman utama Komoditas 2025 dimuat dengan sukses");
}

// Set up scroll reveal animations
function setupScrollReveal() {
    // Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Add scroll event listener
    $(window).on('scroll', function() {
        $('.animate-slide-up').each(function() {
            if (isInViewport(this)) {
                $(this).css('opacity', '1');
            }
        });
    });
    
    // Trigger scroll event once on page load
    $(window).trigger('scroll');
}

// Set up map hover effects
function setupMapEffects() {
    $('.map-container, .map-regions').hover(
        function() {
            $(this).addClass('shadow-lg-hover'); // Custom class for distinct hover
        },
        function() {
            $(this).removeClass('shadow-lg-hover');
        }
    );
}