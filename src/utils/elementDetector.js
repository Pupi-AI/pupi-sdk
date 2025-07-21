export const elementDetectorSource = `
  (() => {
    // This function generates a unique XPath for a given element.
    const getXPath = (element) => {
        if (!element || !(element instanceof Element)) return null;

        // Use ID if it's unique
        if (element.id) {
            const xpathById = "//*[@id='" + element.id + "']";
            try {
                const count = document.evaluate(
                    "count(" + xpathById + ")",
                    document,
                    null,
                    XPathResult.NUMBER_TYPE,
                    null
                ).numberValue;
                if (count === 1) {
                    return xpathById;
                }
            } catch (e) { /* ignore errors in evaluation */ }
        }

        // Use stable data attributes if they are unique
        for (const attr of ['data-testid', 'data-test', 'data-cy', 'name']) {
            const value = element.getAttribute(attr);
            if (value) {
                const xpath = "//" + element.tagName.toLowerCase() + "[@" + attr + "='" + value + "']";
                try {
                    const count = document.evaluate(
                        "count(" + xpath + ")",
                        document,
                        null,
                        XPathResult.NUMBER_TYPE,
                        null
                    ).numberValue;
                    if (count === 1) {
                        return xpath;
                    }
                } catch (e) { /* ignore errors */ }
            }
        }

        // Fallback to structural path
        if (element === document.body) return '/html/body';
        if (!element.parentNode) return "/" + element.tagName.toLowerCase();

        let ix = 0;
        const siblings = element.parentNode.childNodes;
        for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (sibling === element) {
                return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
            }
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                ix++;
            }
        }
        return null;
    };

    const getCleanText = (el) => {
      if (!el) return "";
      const tagName = el.tagName.toLowerCase();
      if (['script', 'style', 'noscript'].includes(tagName)) return "";
      
      let text = el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('placeholder') || el.textContent || "";
      text = text.replace(/\\s+/g, " ").trim();
      if (text.length > 100) {
        text = text.substring(0, 100) + "...";
      }
      return text;
    };

    const isInteractiveElement = (element) => {
      const tagName = element.tagName.toLowerCase();
      const role = element.getAttribute("role");
      
      if (['button', 'input', 'select', 'textarea', 'a'].includes(tagName)) return true;
      if (element.hasAttribute('onclick') || element.getAttribute('jsaction')) return true;
      if (['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio'].includes(role)) return true;
      
      const style = window.getComputedStyle(element);
      if (style.cursor === 'pointer') return true;
      
      return false;
    };

    const determineElementType = (element) => {
      const tagName = element.tagName.toLowerCase();
      const type = element.getAttribute("type");
      
      if (tagName === "textarea" || tagName === "select" || (element.hasAttribute('contenteditable') && element.getAttribute('contenteditable') !== 'false')) return "writeable";
      
      if (tagName === "input") {
        if (!type || ["text", "email", "password", "search", "tel", "url", "number"].includes(type)) return "writeable";
        return "clickable";
      }
      
      if (isInteractiveElement(element)) return "clickable";
      
      return "other";
    };

    const results = [];
    const seenXPaths = new Set();
    const elements = document.querySelectorAll("body *");
    
    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      if (rect.width === 0 || rect.height === 0 || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;
      
      const elementType = determineElementType(element);
      if (elementType === 'other') return;
      
      const xpath = getXPath(element);
      if (!xpath || seenXPaths.has(xpath)) return;
      seenXPaths.add(xpath);
      
      const elementText = getCleanText(element);
      
      results.push({
        selector: xpath,
        type: elementType,
        tag: element.tagName.toLowerCase(),
        text: elementText || undefined,
      });
    });
    
    return results.slice(0, 100);
  })()
`;