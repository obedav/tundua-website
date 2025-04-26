(function($) {
    "use strict";

    $(document).ready(function() {
        console.log("Contact form script loaded");
        
        // Check if the phone field exists
        if ($('#phone').length) {
            console.log("Phone field found in the form");
        } else {
            console.error("Phone field not found in the form!");
        }
        
        $('#contactForm').submit(function(e) {
            e.preventDefault();
            console.log("Contact form submitted");
            
            // Show loading spinner
            $('#submitText').text('Sending...');
            $('#loadingSpinner').removeClass('d-none');
            $('#submitBtn').prop('disabled', true);
            
            const formData = {
                name: $('#name').val(),
                email: $('#email').val(),
                phone: $('#phone').val(),
                subject: $('#subject').val(),
                message: $('#message').val()
            };
            
            console.log("Form data being sent:", formData);

            // Validate required fields
            if (!formData.name || !formData.email || !formData.message) {
                alert('Please fill in all required fields (Name, Email, and Message).');
                
                // Hide loading spinner
                $('#loadingSpinner').addClass('d-none');
                $('#submitBtn').prop('disabled', false);
                $('#submitText').text('Send Message');
                return;
            }
            
            // Submit form data via AJAX
            $.ajax({
                type: 'POST',
                url: '/api/contact',
                data: JSON.stringify(formData),
                contentType: 'application/json',
                success: function(response) {
                    console.log('Form submitted successfully:', response);
                    
                    // Hide loading spinner
                    $('#loadingSpinner').addClass('d-none');
                    $('#submitBtn').prop('disabled', false);
                    $('#submitText').text('Send Message');
                    
                    if (response.success) {
                        // Show success message
                        $('#successMessage').slideDown();
                        $('#contactForm')[0].reset();
                        
                        // Scroll to success message
                        $('html, body').animate({
                            scrollTop: $('#successMessage').offset().top - 100
                        }, 500);
                        
                        // Hide success message after 5 seconds
                        setTimeout(function() {
                            $('#successMessage').slideUp();
                        }, 5000);
                    } else {
                        alert(response.message || 'Something went wrong. Please try again.');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Form submission error:', xhr.responseText);
                    
                    // Hide loading spinner
                    $('#loadingSpinner').addClass('d-none');
                    $('#submitBtn').prop('disabled', false);
                    $('#submitText').text('Send Message');
                    
                    alert('An error occurred. Please try again later.');
                }
            });
        });
    });
})(jQuery);