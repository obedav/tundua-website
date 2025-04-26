// Admin panel JavaScript
$(document).ready(function() {
    // Toggle sidebar on mobile
    $('#sidebarToggle').on('click', function() {
      $('#sidebar').toggleClass('show');
    });
    
    // Auto-dismiss alerts after 5 seconds
    setTimeout(function() {
      $('.alert-dismissible').alert('close');
    }, 5000);
    
    // File input preview
    $('input[type="file"]').change(function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          $('#imagePreview').html('<img src="' + event.target.result + '" class="img-thumbnail mt-2" style="max-height: 200px;">');
        }
        reader.readAsDataURL(file);
      }
    });
  });