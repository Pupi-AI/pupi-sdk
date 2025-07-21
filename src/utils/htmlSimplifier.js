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

    // First, apply aggressive simplification for AI processing
    stabilized = this.simplifyForAI(stabilized);

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
  },

  simplifyForAI(html) {
    if (!html || typeof html !== 'string') {
      return '';
    }

    let simplified = html;

    // Remove everything in head tag completely
    simplified = simplified.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
    
    // Remove all script and style content
    simplified = simplified.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    simplified = simplified.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove comments
    simplified = simplified.replace(/<!--[\s\S]*?-->/g, '');
    
    // Remove common non-interactive elements that take up space
    simplified = simplified.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
    simplified = simplified.replace(/<img[^>]*>/gi, '');
    simplified = simplified.replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '');
    simplified = simplified.replace(/<audio[^>]*>[\s\S]*?<\/audio>/gi, '');
    simplified = simplified.replace(/<canvas[^>]*>[\s\S]*?<\/canvas>/gi, '');
    simplified = simplified.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
    
    // Remove hidden elements
    simplified = simplified.replace(/<[^>]*style[^>]*display\s*:\s*none[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
    simplified = simplified.replace(/<[^>]*style[^>]*visibility\s*:\s*hidden[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
    simplified = simplified.replace(/<[^>]*\bhidden\b[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
    
    // Remove all attributes except essential ones for element identification
    const essentialAttrs = ['id', 'class', 'name', 'type', 'value', 'href', 'src', 'alt', 'title', 'placeholder', 'aria-label', 'role', 'data-testid', 'data-test', 'data-cy'];
    simplified = simplified.replace(/<([^>]+)>/g, (match, tagContent) => {
      const tagName = tagContent.split(/\s/)[0];
      const attrs = [];
      
      essentialAttrs.forEach(attr => {
        const attrRegex = new RegExp(`\\s${attr}\\s*=\\s*["']([^"']*)["']`, 'i');
        const attrMatch = tagContent.match(attrRegex);
        if (attrMatch) {
          attrs.push(`${attr}="${attrMatch[1]}"`);
        }
      });
      
      return `<${tagName}${attrs.length ? ' ' + attrs.join(' ') : ''}>`;
    });
    
    // Remove excessive whitespace and empty lines
    simplified = simplified.replace(/\s+/g, ' ');
    simplified = simplified.replace(/>\s+</g, '><');
    simplified = simplified.replace(/\n\s*\n/g, '\n');
    
    // Remove empty elements
    simplified = simplified.replace(/<([^>]+)>\s*<\/\1>/g, '');
    
    // Limit to body content only
    const bodyMatch = simplified.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      simplified = bodyMatch[1];
    }
    
    // Final cleanup - remove very long text nodes that are likely not relevant
    simplified = simplified.replace(/>([^<]{200,})</g, (match, text) => {
      // Keep if it contains interactive keywords
      if (/\b(click|button|link|input|select|submit|login|search|menu|nav)\b/i.test(text)) {
        return `>${text.substring(0, 100)}...</`;
      }
      return '><text-content-truncated/></';
    });
    
    return simplified.trim();
  }
};

export default htmlSimplifier;