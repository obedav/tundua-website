// Add this script to public/js/questionnaire.js

$(document).ready(function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const school = urlParams.get('school');
    const course = urlParams.get('course');
    
    // Auto-populate fields if parameters exist
    if (school) {
        $('#university').val(school.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()));
    }
    
    if (course) {
        $('#intendedMajor').val(course.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()));
    }
    
    // Navigation between steps
    $('.next-step').click(function() {
        const currentStep = $(this).closest('.form-section-inner').data('step');
        const nextStep = currentStep + 1;
        
        // Simple validation (can be enhanced)
        let isValid = true;
        const requiredFields = $(this).closest('.form-section-inner').find('[required]');
        
        requiredFields.each(function() {
            if (!$(this).val()) {
                isValid = false;
                $(this).addClass('is-invalid');
            } else {
                $(this).removeClass('is-invalid');
            }
        });
        
        if (!isValid) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Proceed to next step
        $('.form-section-inner').removeClass('active');
        $(`.form-section-inner[data-step="${nextStep}"]`).addClass('active');
        
        // Update progress steps
        $('.step').removeClass('active');
        $(`.step[data-step="${nextStep}"]`).addClass('active');
        
        // Mark previous steps as completed
        for (let i = 1; i < nextStep; i++) {
            $(`.step[data-step="${i}"]`).addClass('completed');
        }
        
        // Scroll to top of form
        $('html, body').animate({
            scrollTop: $('.form-section').offset().top - 100
        }, 500);
    });
    
    $('.prev-step').click(function() {
        const currentStep = $(this).closest('.form-section-inner').data('step');
        const prevStep = currentStep - 1;
        
        $('.form-section-inner').removeClass('active');
        $(`.form-section-inner[data-step="${prevStep}"]`).addClass('active');
        
        $('.step').removeClass('active');
        $(`.step[data-step="${prevStep}"]`).addClass('active');
        
        // Scroll to top of form
        $('html, body').animate({
            scrollTop: $('.form-section').offset().top - 100
        }, 500);
    });
    
    // Form submission
    $('#questionnaire-form').submit(function(e) {
        e.preventDefault();
        
        // Show loading indicator
        $('.form-section').append('<div class="loading-overlay"><div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div></div>');
        
        // Create form data object
        const formData = {
            // Personal Information
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            dob: $('#dob').val(),
            nationality: $('#nationality').val(),
            address: $('#address').val(),
            
            // Academic Background
            highestQualification: $('#highestQualification').val(),
            graduationYear: $('#graduationYear').val(),
            institution: $('#institution').val(),
            fieldOfStudy: $('#fieldOfStudy').val(),
            gpa: $('#gpa').val(),
            englishTest: $('#englishTest').val(),
            englishScore: $('#englishScore').val(),
            
            // Study Preferences
            studyLevel: $('#studyLevel').val(),
            intendedMajor: $('#intendedMajor').val(),
            studyCountry: $('#studyCountry').val(),
            university: $('#university').val(),
            intakeDate: $('#intakeDate').val(),
            budget: $('#budget').val(),
            
            // Additional Details
            experience: $('#experience').val(),
            extracurricular: $('#extracurricular').val(),
            goals: $('#goals').val(),
            additionalInfo: $('#additionalInfo').val()
        };
        
        // Add referral data if it exists in URL params
        if (school) formData.referredSchool = school;
        if (course) formData.referredCourse = course;
        
        // Submit form data via AJAX
        $.ajax({
            type: 'POST',
            url: '/api/submit-questionnaire',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                // Remove loading indicator
                $('.loading-overlay').remove();
                
                // Show success message
                $('.form-section').html(`
                    <div class="text-center py-5">
                        <i class="fa fa-check-circle fa-5x text-success mb-4"></i>
                        <h2>Thank You!</h2>
                        <p class="lead">Your questionnaire has been submitted successfully.</p>
                        <p>One of our education consultants will contact you within 24-48 hours to discuss the next steps.</p>
                        <div class="mt-4">
                            <a href="index.html" class="btn btn-primary">Return to Homepage</a>
                        </div>
                    </div>
                `);
                
                // Scroll to top of form
                $('html, body').animate({
                    scrollTop: $('.form-section').offset().top - 100
                }, 500);
            },
            error: function(xhr, status, error) {
                // Remove loading indicator
                $('.loading-overlay').remove();
                
                // Show error message
                let errorMessage = 'An error occurred. Please try again later.';
                
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                
                alert(errorMessage);
            }
        });
    });
});