/**
 * Helper to convert any input[type="password"] into an interactive password field with an eye toggle icon.
 * By default, passwords are masked. Clicking the eye icon toggles between 'password' and 'text'.
 */
export function setupPasswordToggles(container) {
  if (!container) return;

  const passwordInputs = container.querySelectorAll('input[type="password"], input[data-password-toggle="true"]');

  passwordInputs.forEach(input => {
    // If input is already wrapped in .password-field-wrapper, check if button is attached
    let wrapper = input.closest('.password-field-wrapper');

    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'password-field-wrapper';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
    }

    if (!wrapper.querySelector('.btn-toggle-password')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'btn-toggle-password';
      toggleBtn.title = 'Show Password';
      toggleBtn.setAttribute('aria-label', 'Toggle Password Visibility');
      toggleBtn.innerHTML = '<i class="ri-eye-off-line"></i>';

      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        input.setAttribute('data-password-toggle', 'true');
        toggleBtn.innerHTML = isPassword ? '<i class="ri-eye-line"></i>' : '<i class="ri-eye-off-line"></i>';
        toggleBtn.title = isPassword ? 'Hide Password' : 'Show Password';
      });

      wrapper.appendChild(toggleBtn);
    }
  });
}
