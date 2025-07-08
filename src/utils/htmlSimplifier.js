const htmlSimplifier = {
  simplify(html) {
    if (!html || typeof html !== 'string') {
      return '';
    }

    let simplified = html;

    // Remove script tags and their content
    simplified = simplified.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Remove style tags and their content
    simplified = simplified.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML comments
    simplified = simplified.replace(/<!--[\s\S]*?-->/g, '');
    
    // Remove meta tags
    simplified = simplified.replace(/<meta[^>]*>/gi, '');
    
    // Remove link tags (stylesheets, favicons, etc.)
    simplified = simplified.replace(/<link[^>]*>/gi, '');
    
    // Remove noscript tags and their content
    simplified = simplified.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
    
    // Remove hidden elements (display: none, visibility: hidden)
    simplified = simplified.replace(/<[^>]*style[^>]*display\s*:\s*none[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
    simplified = simplified.replace(/<[^>]*style[^>]*visibility\s*:\s*hidden[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
    
    // Remove elements with hidden attribute
    simplified = simplified.replace(/<[^>]*\bhidden\b[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
    
    // Remove common non-content elements
    simplified = simplified.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
    simplified = simplified.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
    simplified = simplified.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
    simplified = simplified.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
    
    // Remove empty elements
    simplified = simplified.replace(/<([^>]+)>\s*<\/\1>/g, '');
    
    // Clean up excessive whitespace
    simplified = simplified.replace(/\s+/g, ' ');
    simplified = simplified.replace(/>\s+</g, '><');
    
    // Trim the result
    simplified = simplified.trim();
    
    return simplified;
  },

  extractText(html) {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // First simplify to remove unnecessary content
    let simplified = this.simplify(html);
    
    // Remove all remaining HTML tags
    simplified = simplified.replace(/<[^>]*>/g, ' ');
    
    // Clean up whitespace
    simplified = simplified.replace(/\s+/g, ' ');
    simplified = simplified.trim();
    
    return simplified;
  },

  preserveSemantics(html) {
    if (!html || typeof html !== 'string') {
      return '';
    }

    let semantic = this.simplify(html);
    
    // Remove all style attributes
    semantic = semantic.replace(/\sstyle\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove class attributes (mostly for styling)
    semantic = semantic.replace(/\sclass\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove id attributes (mostly for styling/js)
    semantic = semantic.replace(/\sid\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove data attributes except stable selector ones
    semantic = semantic.replace(/\sdata-(?!(testid|test|cy|selenium-id|id|key|index|value|type|component|widget|control|element))[^=]*\s*=\s*["'][^"']*["']/gi, '');
    
    return semantic;
  },

  replaceWithStableSelectors(html, interactiveElements = []) {
    if (!html || typeof html !== 'string') {
      return '';
    }

    let stabilized = html;

    // Remove problematic dynamic attributes
    const dynamicAttributes = [
      'jsname', 'jsaction', 'jscontroller', 'jsmodel', 'jsdata',
      'data-ved', 'data-hveid', 'data-fid', 'data-pid'
    ];

    dynamicAttributes.forEach(attr => {
      const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
      stabilized = stabilized.replace(regex, '');
    });

    // If we have interactive elements, try to add stable selectors
    if (interactiveElements && interactiveElements.length > 0) {
      interactiveElements.forEach(element => {
        if (element.selector && element.text) {
          // Try to find the element in HTML and add a stable selector
          const textPattern = element.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(<[^>]*>\\s*${textPattern}\\s*<\\/[^>]*>)`, 'gi');
          
          stabilized = stabilized.replace(regex, (match) => {
            // Add data-stable-selector if not already present
            if (!match.includes('data-stable-selector')) {
              return match.replace(/(<[^>]*?)>/, `$1 data-stable-selector="${element.selector.replace(/"/g, '&quot;')}">`);
            }
            return match;
          });
        }
      });
    }

    return stabilized;
  }
};

export default htmlSimplifier;