import setPropOrAttr from './setPropOrAttr.js';

// Example 1: Setting properties that exist on HTMLElement
document.addEventListener('DOMContentLoaded', () => {
  // Create test elements
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  
  const input = document.createElement('input');
  input.type = 'text';
  
  const div = document.createElement('div');
  
  // Example with property that exists - checkbox.checked
  setPropOrAttr(checkbox, 'checked', true);
  console.log('Checkbox checked property:', checkbox.checked); // true
  console.log('Checkbox checked attribute:', checkbox.getAttribute('checked')); // null

  // Example with property that exists - input.value
  setPropOrAttr(input, 'value', 'Hello World');
  console.log('Input value property:', input.value); // "Hello World"
  console.log('Input value attribute:', input.getAttribute('value')); // null
  
  // Example with attribute - custom data attribute doesn't exist as property
  setPropOrAttr(div, 'data-custom', 'custom-value');
  console.log('Div data-custom property:', div['data-custom']); // undefined
  console.log('Div data-custom attribute:', div.getAttribute('data-custom')); // "custom-value"
  
  // Example with aria attribute
  setPropOrAttr(div, 'aria-hidden', 'true');
  console.log('Div aria-hidden attribute:', div.getAttribute('aria-hidden')); // "true"
  
  // Append to document for inspection
  document.body.appendChild(checkbox);
  document.body.appendChild(input);
  document.body.appendChild(div);
});