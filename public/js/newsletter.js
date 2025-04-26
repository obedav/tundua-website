(function($) {
    "use strict";

    $(document).ready(function() {
        console.log("Newsletter script loaded");
        
        // Handle main newsletter form submission
        $('#newsletterForm').submit(function(e) {
            e.preventDefault();
            submitNewsletterForm($(this), $('#newsletterEmail').val(), $('#newsletterMessage'));
        });
        
        // Handle footer newsletter form submission
        $('#footerNewsletterForm').submit(function(e) {
            e.preventDefault();
            submitNewsletterForm($(this), $('#footerNewsletterEmail').val(), $('#footerNewsletterMessage'));
        });
        
        // Handle inline newsletter form submission
        $('#inlineNewsletterForm').submit(function(e) {
            e.preventDefault();
            submitNewsletterForm($(this), $('#inlineNewsletterEmail').val(), $('#inlineNewsletterMessage'));
        });
        
        function submitNewsletterForm(form, email, messageElement) {
            // Validate email
            if (!email) {
                showMessage(messageElement, 'Please enter your email address.', 'text-danger');
                return;
            }
            
            // Disable submit button
            form.find('button[type="submit"]').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Subscribing...');
            
            // Submit form data via AJAX
            $.ajax({
                type: 'POST',
                url: '/api/newsletter/subscribe',
                data: JSON.stringify({ email: email }),
                contentType: 'application/json',
                success: function(response) {
                    console.log('Newsletter subscription successful:', response);
                    
                    if (response.success) {
                        // Show success message
                        showMessage(messageElement, 'Thank you for subscribing to our newsletter!', 'text-success');
                        form[0].reset();
                    } else {
                        // Show error message
                        showMessage(messageElement, response.message || 'Something went wrong. Please try again.', 'text-danger');
                    }
                    
                    // Re-enable submit button
                    form.find('button[type="submit"]').prop('disabled', false).text('Subscribe');
                },
                error: function(xhr, status, error) {
                    console.error('Newsletter subscription error:', xhr.responseText);
                    
                    let errorMessage = 'An error occurred. Please try again later.';
                    
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errorMessage = xhr.responseJSON.message;
                    }
                    
                    showMessage(messageElement, errorMessage, 'text-danger');
                    
                    // Re-enable submit button
                    form.find('button[type="submit"]').prop('disabled', false).text('Subscribe');
                }
            });
        }
        
        function showMessage(element, message, className) {
            element.html(`<span class="${className}">${message}</span>`);
            
            // Clear message after 5 seconds if it's a success message
            if (className === 'text-success') {
                setTimeout(function() {
                    element.html('');
                }, 5000);
            }
        }
    });
})(jQuery);