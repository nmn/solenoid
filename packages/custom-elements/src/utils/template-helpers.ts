import { getTemplate, getOrCreateTemplate, setTemplate } from "./template-registry";

// Why: Provides consistent template handling and warning messages across components
export function getTemplateContent(
  element: HTMLElement,
  templateId: string | null,
  componentName: string
): string | null {
  // Try template registry first if templateId exists
  let registryTemplate = templateId ? getTemplate(templateId) : null;
  if (registryTemplate) {
    // console.log(`Using template from registry: ${templateId}`);
    return registryTemplate;
  }
  
  
  registryTemplate = getOrCreateTemplate(templateId);
  if (registryTemplate) {
    return registryTemplate;
  }

  // Look for template in document
  if (templateId) {
    const templateElement = document.getElementById(templateId);
    if (templateElement) {
      const template = templateElement.innerHTML;
      templateElement.remove();
      // console.log(`Using template from template-id: ${templateId}`);
      if (template) {
        setTemplate(templateId, template);
        return template;
      }
    }
  }


  if (!registryTemplate) {
    const templateElement = element.querySelector("template");
    if (templateElement) {
      const content = templateElement.innerHTML;
      templateElement.remove();
      // console.log(`Using template from element: ${templateId}`);
      if (templateId) {
        setTemplate(templateId, content);
      }
      return content;
    }
  }
  // Use innerHTML if available
  const innerHTML = element.innerHTML.trim();
  if (innerHTML) {
    const content = innerHTML;
    // console.log(`Using template from innerHTML: ${templateId}`);
    if (templateId) {
      setTemplate(templateId, content);
    }
    return content;
  }
  // Warn if no template found
  console.warn(`${componentName} must have either:
  1. A template element with id="${templateId}"
  2. An inline <template> element
  3. Direct innerHTML content`);

  return null;
}
