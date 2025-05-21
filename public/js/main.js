// General JavaScript for the application
document.addEventListener('DOMContentLoaded', function() {
    // Close alert messages after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
      }, 5000);
    });
  
    // Initialize any other global functionality
  });