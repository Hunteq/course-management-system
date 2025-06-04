// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap components
    initBootstrapComponents();
    
    // Setup question form dynamic behavior
    setupQuestionForm();
    
    // Setup test timer if on test page
    if (document.getElementById('testTimer')) {
      setupTestTimer();
    }
    
    // Setup batch selection based on role
    setupBatchSelection();
    
    // Initialize any rich text editors
    initEditors();
    
    // Setup form validations
    setupFormValidations();
  });
  
  // Initialize Bootstrap components
  function initBootstrapComponents() {
    // Tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.addEventListener('shown.bs.modal', function () {
        const input = modal.querySelector('input[autofocus]');
        if (input) input.focus();
      });
    });
  }
  
  // Dynamic form handling for question creation
  function setupQuestionForm() {
    const questionType = document.getElementById('questionType');
    const mcqOptions = document.getElementById('mcqOptions');
    const correctAnswer = document.getElementById('correctAnswerField');
    const optionsContainer = document.getElementById('optionsContainer');
    const addOptionBtn = document.getElementById('addOption');
    
    if (questionType && mcqOptions && correctAnswer) {
      // Toggle fields based on question type
      questionType.addEventListener('change', function() {
        if (this.value === 'mcq') {
          mcqOptions.style.display = 'block';
          correctAnswer.style.display = 'none';
        } else {
          mcqOptions.style.display = 'none';
          correctAnswer.style.display = 'block';
        }
      });
      
      // Add option button
      if (addOptionBtn && optionsContainer) {
        let optionCount = optionsContainer.children.length;
        
        addOptionBtn.addEventListener('click', function() {
          const newOption = document.createElement('div');
          newOption.className = 'option-item mb-2';
          newOption.innerHTML = `
            <div class="input-group">
              <input type="text" class="form-control" name="options[]" placeholder="Option text" required>
              <div class="input-group-text">
                <input class="form-check-input" type="checkbox" name="isCorrect_${optionCount}">
              </div>
              <button type="button" class="btn btn-outline-danger remove-option">×</button>
            </div>
          `;
          optionsContainer.appendChild(newOption);
          optionCount++;
        });
        
        // Remove option button
        optionsContainer.addEventListener('click', function(e) {
          if (e.target.classList.contains('remove-option')) {
            e.target.closest('.option-item').remove();
          }
        });
      }
    }
  }
  
  // Setup test timer functionality
  function setupTestTimer() {
    const timerElement = document.getElementById('testTimer');
    if (!timerElement) return;
    
    const endTime = new Date(timerElement.dataset.endTime).getTime();
    const form = document.querySelector('form');
    
    function updateTimer() {
      const now = new Date().getTime();
      const distance = endTime - now;
      
      // Time calculations
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Display result
      timerElement.innerHTML = `
        <span class="hours">${hours}h</span>
        <span class="minutes">${minutes}m</span>
        <span class="seconds">${seconds}s</span>
      `;
      
      // If countdown is finished, submit form
      if (distance < 0) {
        timerElement.innerHTML = "TIME EXPIRED";
        if (form) form.submit();
      }
    }
    
    // Update timer every second
    updateTimer();
    setInterval(updateTimer, 1000);
  }
  
  // Show/hide batch field based on role selection
  function setupBatchSelection() {
    const roleSelect = document.querySelector('select[name="role"]');
    const batchField = document.getElementById('batchField');
    
    if (roleSelect && batchField) {
      roleSelect.addEventListener('change', function() {
        batchField.style.display = this.value === 'student' ? 'block' : 'none';
      });
      
      // Initialize visibility
      batchField.style.display = roleSelect.value === 'student' ? 'block' : 'none';
    }
  }
  
  // Initialize rich text editors
  function initEditors() {
    // Initialize any rich text editors if needed
    // Example using TinyMCE (would need to be included in layout)
    if (typeof tinymce !== 'undefined') {
      tinymce.init({
        selector: '.rich-editor',
        plugins: 'link lists code',
        toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright | bullist numlist | link code',
        menubar: false,
        statusbar: false
      });
    }
  }
  
  // Form validations
  function setupFormValidations() {
    // Password confirmation validation
    const passwordForms = document.querySelectorAll('form[data-password-confirm]');
    passwordForms.forEach(form => {
      const password = form.querySelector('input[name="password"]');
      const confirm = form.querySelector('input[name="password2"]');
      
      if (password && confirm) {
        form.addEventListener('submit', function(e) {
          if (password.value !== confirm.value) {
            e.preventDefault();
            alert('Passwords do not match!');
            confirm.focus();
          }
        });
      }
    });
    
    // Date validation (end date after start date)
    const dateForms = document.querySelectorAll('form[data-date-validation]');
    dateForms.forEach(form => {
      const startDate = form.querySelector('input[name="startDate"]');
      const endDate = form.querySelector('input[name="endDate"]');
      
      if (startDate && endDate) {
        form.addEventListener('submit', function(e) {
          if (new Date(startDate.value) >= new Date(endDate.value)) {
            e.preventDefault();
            alert('End date must be after start date!');
            endDate.focus();
          }
        });
      }
    });
  }
  
  // AJAX helper functions
  function fetchData(url, callback) {
    fetch(url)
      .then(response => response.json())
      .then(data => callback(data))
      .catch(error => console.error('Error:', error));
  }
  
  function postData(url, data, callback) {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => callback(data))
    .catch(error => console.error('Error:', error));
  }
  
  // Toast notifications
  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast show align-items-center text-white bg-${type}`;
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
  
  function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
  }