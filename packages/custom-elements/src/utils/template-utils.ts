/**
 * Escapes HTML special characters in a string
 * @param value - The value to escape
 * @param escapeHtml - Whether to escape HTML characters (default: true)
 */
export function escapeValue(value: unknown, escapeHtml = true): string {
  // Handle null or undefined
  if (value == null) return '';
  
  // Convert to string if not already
  const str = String(value);
  
  if (!escapeHtml) return str;
  
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Interpolates a template string with values from a context object
 * @param template - The template string containing ${expressions}
 * @param context - Object containing values for interpolation
 * @param options - Configuration options
 */
export function interpolateTemplate(
  template: string, 
  context: Record<string, unknown>,
  options: { escapeHtml?: boolean } = {}
): string {
  const { escapeHtml = true } = options;
  
  return template.replace(/\${([^}]+)}/g, (match, expr) => {
    try {
      // Handle JSON.stringify specifically
      const contextKeys = Object.keys(context);
      const contextValues = Object.values(context);
      
      // Regular expression evaluation
      const value = new Function(...contextKeys, `return ${expr}`)(...contextValues);
      return escapeValue(value, escapeHtml);
    } catch (error) {
      console.error('Error interpolating template:', error);
      return '';
    }
  });
}

/**
 * Transforms template expressions by replacing 'this.' with '$this.' within ${...} blocks
 * @param template - The template string to transform
 * @returns The transformed template string
 */
export function transformTemplate(template: string): string {
  return template.replace(/\${(.*?)}/g, (match, expr) => {
    return '${' + expr.replace(/this\./g, '$this.') + '}';
  });
}

/**
 * Generates a path-based key for an element based on its position in the DOM
 */
export function getElementPath(element: Element): string {
  const path: string[] = [];
  let current = element;
  while (current.parentElement) {
    const index = Array.from(current.parentElement.children).indexOf(current);
    path.unshift(`${current.tagName}:${index}`);
    current = current.parentElement;
  }
  return path.join(">");
}

/**
 * Generates a unique key for an element's attribute
 */
export function getAttributeKey(element: Element, attrName: string): string {
  return `${getElementPath(element)}@${attrName}`;
}

/**
 * Generates a unique template ID based on the element's position in the DOM and name
 */
export function generateTemplateId(element: Element): string {
  const path = getElementPath(element);
  const hash = path.split('>').map(p => p.split(':')[0]).join('-').toLowerCase();
  return `template-id-${hash}`;
}
