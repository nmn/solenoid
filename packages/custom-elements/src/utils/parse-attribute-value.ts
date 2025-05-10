export function parseAttributeValue(value: string) {
  // Trim whitespace from the input
  if (typeof value === "string") {
    value = value.trim();
  } else {
    return value;
  }
  // Check for simple values
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "" || value === "''" || value === '""') return "";
  if (value === "null") return null;
  if (value === "undefined") return undefined;

  // Try to parse as a number
  const num = Number(value);
  if (!isNaN(num)) return num;

  // Handle array-like strings with single quotes
  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      // Replace single quotes with double quotes
      const jsonString = value.replace(/'/g, '"');
      return JSON.parse(jsonString);
    } catch (_e) {
      // If parsing fails, fall through to the next step
    }
  }

  // Try to parse as JSON
  try {
    return JSON.parse(value);
  } catch (_e) {
    // If it's not valid JSON, check for unquoted strings
    if (/^[a-zA-Z0-9_]+$/.test(value)) {
      return value;
    }

    // For other cases, wrap the value in quotes and try parsing again
    try {
      return JSON.parse(`"${value}"`);
    } catch (_e) {
      console.error("Error parsing attribute value", value);
      // If all else fails, return the original string
      return value;
    }
  }
}
