export const elementDetectorSource = `
  (() => {
    const isHumanText = (text) => {
      if (!text || text.length < 2) return false;
      
      // Closing tag (/, /div, /span vs.)
      if (text.startsWith('/')) return false;
      
      // Sadece teknik kodlar (uzun CSS class isimleri vs)
      if (/^[a-zA-Z0-9_-]+$/.test(text) && text.length > 20) return false;
      
      // URL'ler
      if (text.includes('http') || text.includes('www.') || text.includes('.com')) return false;
      
      // Dosya uzantıları
      if (/\\.(js|css|png|jpg|gif|svg|html|php|json)$/i.test(text)) return false;
      
      // Function çağrıları
      if (/\\w+\\s*\\(\\s*\\)/.test(text)) return false;
      
      // Sadece sayı/sembol/noktalama
      if (/^[\\d\\W_-]+$/.test(text)) return false;
      
      // CSS/hex renkler
      if (/^#[0-9a-fA-F]{3,6}$/.test(text) || /rgb\\(/.test(text)) return false;
      
      // CSS unit'leri
      if (/^\\d+(px|em|%|rem|pt)$/.test(text)) return false;
      
      // Boolean değerler
      if (['true', 'false', 'null', 'undefined'].includes(text.toLowerCase())) return false;
      
      // Anlamlı kelime içermeli
      const words = text.split(/\\s+/).filter(w => w.length >= 2);
      return words.length > 0;
    };

    const extractHumanText = (content) => {
      if (!content) return "";
      
      let humanTexts = new Set(); // Tekrarları önlemek için Set kullan
      
      // 1. Attribute değerlerini yakala (tüm attribute türleri)
      const attributePattern = /(\\w+)=["']([^"']+)["']/g;
      let match;
      
      while ((match = attributePattern.exec(content)) !== null) {
        const attrName = match[1].toLowerCase();
        const attrValue = match[2].trim();
        
        // Teknik attribute'ları atla
        const skipAttributes = ['class', 'id', 'style', 'onclick', 'onmouseover', 'onmouseout', 
                               'src', 'href', 'target', 'rel', 'type', 'name', 'value', 'tabindex', 'role', 
                               'data-tooltip-position', 'data-testid', 'data-test', 'data-cy', 'data-selenium-id', 
                               'data-component', 'data-widget', 'data-control', 'data-element', 'data-key', 
                               'data-index', 'data-value', 'data-type', 'autocomplete', 'spellcheck', 
                               'contenteditable', 'draggable', 'dropzone', 'hidden', 'translate', 'dir', 'lang'];
        
        // js ile başlayan tüm attribute'ları atla (jsaction, jscontroller, jsname, jslazy, vb.)
        const isJsAttribute = attrName.startsWith('js');
        
        if (!skipAttributes.includes(attrName) && !isJsAttribute && isHumanText(attrValue)) {
          humanTexts.add(attrValue.replace(/\\s+/g, ' ').replace(/[^\\w\\sçğıöşüÇĞIİÖŞÜ.,!?-]/g, ' ').trim());
        }
      }
      
      // 2. Tag içindeki metinleri yakala (opening ve closing tag arası)
      const textPattern = />([^<]+)</g;
      while ((match = textPattern.exec(content)) !== null) {
        const text = match[1].trim();
        if (isHumanText(text) && !text.startsWith('/')) { // Closing tag değil
          humanTexts.add(text.replace(/\\s+/g, ' ').replace(/[^\\w\\sçğıöşüÇĞIİÖŞÜ.,!?-]/g, ' ').trim());
        }
      }
      
      // 3. HTML tag olmayan normal metinleri yakala
      const lines = content.split(/[<>]/);
      lines.forEach(line => {
        const cleaned = line.trim();
        // HTML tag içermez, sadece plain text
        if (cleaned && !cleaned.includes('=') && !cleaned.includes('/') && isHumanText(cleaned)) {
          humanTexts.add(cleaned.replace(/\\s+/g, ' ').replace(/[^\\w\\sçğıöşüÇĞIİÖŞÜ.,!?-]/g, ' ').trim());
        }
      });
      
      const result = Array.from(humanTexts).join('. ');
      return result || '';
    };

    const getCleanText = (el) => {
      if (!el) return "";
      
      // Skip script and style tags completely
      const tagName = el.tagName.toLowerCase();
      if (['script', 'style', 'noscript'].includes(tagName)) return "";
      
      // For specific input elements, get their value only (no placeholder)
      if (tagName === 'input') {
        const type = el.getAttribute('type') || 'text';
        if (['submit', 'button'].includes(type)) {
          return el.value || "";
        }
        return "";
      }
      
      // For permission elements, extract only technical attributes (no human-readable text)
      if (tagName === 'permission') {
        const permissionParts = [];
        
        // Get permission type (e.g., "microphone camera") - technical value only
        const type = el.getAttribute('type');
        if (type) {
          permissionParts.push(\`Permission: \${type}\`);
        }
        
        // Get data-* attributes that have technical values only
        const dataPermission = el.getAttribute('data-permission');
        if (dataPermission) permissionParts.push(dataPermission);
        
        return permissionParts.join(' - ');
      }
      
      // For buttons, get only direct text content (no human-readable attributes)
      if (tagName === 'button') {
        // Get direct text content only (not from children)
        const directText = Array.from(el.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent.trim())
          .join(' ')
          .trim();
        
        if (directText) return directText;
      }
      
      // For other elements, first try intelligent text extraction
      const htmlContent = el.outerHTML;
      if (htmlContent) {
        const extractedText = extractHumanText(htmlContent);
        if (extractedText) return extractedText;
      }
      
      // Fallback to original logic
      let text = "";
      
      // Get text content but exclude script/style children
      const walker = document.createTreeWalker(
        el,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            
            const parentTag = parent.tagName.toLowerCase();
            if (['script', 'style', 'noscript'].includes(parentTag)) {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Skip if parent is hidden
            const computedStyle = window.getComputedStyle(parent);
            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
              return NodeFilter.FILTER_REJECT;
            }
            
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      
      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        const nodeText = node.textContent.trim();
        if (nodeText && !nodeText.match(/^[\\s\\n\\r\\t]*$/)) {
          textNodes.push(nodeText);
        }
      }
      
      text = textNodes.join(' ').trim();
      
      // If text is empty or undefined, try to get text from tooltip, label, or title attributes
      if (!text) {
        const attributes = el.attributes;
        let fallbackText = '';
        
        // Check all attributes for tooltip, title, label keywords
        for (let i = 0; i < attributes.length; i++) {
          const attr = attributes[i];
          const attrName = attr.name.toLowerCase();
          
          // Check if attribute name contains tooltip, title, label keywords
          if ((attrName.includes('tooltip') || attrName.includes('title') || 
               attrName.includes('label') || attrName === 'aria-label') && 
              attr.value && attr.value.trim()) {
            fallbackText = attr.value.trim();
            break; // Use the first match found
          }
        }
        
        if (fallbackText) {
          text = fallbackText;
        }
      }
      
      if (!text) return "";
      
      // Clean up the text
      text = text.replace(/\\s+/g, " ").trim();
      
      // Limit text length and avoid JavaScript-like content
      if (text.length > 200) {
        text = text.substring(0, 200) + "...";
      }
      
      // Filter out obvious JavaScript patterns
      if (text.includes('function(') || 
          text.includes('window.') || 
          text.includes('document.') ||
          text.includes('var ') ||
          text.includes('let ') ||
          text.includes('const ') ||
          text.match(/[{}();]/g)?.length > 5) {
        return "";
      }
      
      return text;
    };

    const getReactHandlers = (element) => {
      const reactKey = Object.keys(element).find(
        (key) => key.startsWith("__reactProps$") || key.startsWith("__reactEventHandlers$")
      );
      if (reactKey) {
        const props = element[reactKey];
        return Object.keys(props).filter(
          (key) => typeof props[key] === "function" && (key.startsWith("on") || key.includes("Handler"))
        );
      }
      return [];
    };

    const getAngularHandlers = (element) => {
      const handlers = [];
      const attributes = element.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (attr.name.startsWith("(") && attr.name.endsWith(")")) {
          handlers.push(attr.name.slice(1, -1));
        }
        if (attr.name.startsWith("ng-")) {
          handlers.push(attr.name.slice(3));
        }
      }
      return handlers;
    };

    const getVueHandlers = (element) => {
      const handlers = [];
      const attributes = element.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (attr.name.startsWith("v-on:") || attr.name.startsWith("@")) {
          handlers.push(attr.name.replace("v-on:", "").replace("@", ""));
        }
      }
      const vueKey = Object.keys(element).find((key) => key.startsWith("__vue__"));
      if (vueKey) {
        const vueInstance = element[vueKey];
        const eventKeys = Object.keys(vueInstance?.$options?.listeners || {});
        handlers.push(...eventKeys);
      }
      return handlers;
    };

    const getNativeListeners = (element) => {
      const ALL_EVENTS = [
        "click", "dblclick", "mousedown", "mouseup", "mouseover", "mouseout", "mousemove",
        "keydown", "keyup", "keypress", "focus", "blur", "change", "submit", "input",
        "touchstart", "touchend", "touchmove", "drag", "drop",
      ];
      const handlers = [];
      const tagName = element.tagName.toLowerCase();
      ALL_EVENTS.forEach((eventType) => {
        const attr = element.getAttribute(\`on\${eventType}\`);
        if (attr) {
          handlers.push(eventType);
        }
      });
      const eventSymbol = Object.getOwnPropertySymbols(element).find((sym) =>
        sym.toString().includes("eventListeners")
      );
      if (eventSymbol && element[eventSymbol]) {
        handlers.push(...Object.keys(element[eventSymbol]));
      }
      
      // Handle custom elements with jsaction attributes (Google-style)
      const jsaction = element.getAttribute("jsaction");
      if (jsaction) {
        // jsaction can be "click:functionName" or "click:functionName;hover:otherFunction"
        const actions = jsaction.split(";");
        actions.forEach(action => {
          const [event, handler] = action.split(":");
          if (event && handler) {
            handlers.push(event.trim());
          }
        });
      }
      
      // Handle elements with jscontroller (usually indicates interactive elements)
      const jscontroller = element.getAttribute("jscontroller");
      if (jscontroller) {
        handlers.push("js-controller");
      }
      
      // Handle data-* attributes that might indicate click handlers
      const dataClick = element.getAttribute("data-click") || element.getAttribute("data-action");
      if (dataClick) {
        handlers.push("data-click");
      }
      
      // Handle elements with event delegation patterns
      const dataEvent = element.getAttribute("data-event");
      if (dataEvent) {
        handlers.push(dataEvent);
      }
      
      // Handle Stimulus framework (Rails/Hotwire)
      const stimulusController = element.getAttribute("data-controller");
      const stimulusAction = element.getAttribute("data-action");
      if (stimulusController) {
        handlers.push("stimulus-controller");
      }
      if (stimulusAction) {
        handlers.push("stimulus-action");
      }
      
      // Handle Alpine.js directives
      const attributes = element.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (attr.name.startsWith("x-on:") || attr.name.startsWith("@")) {
          handlers.push(attr.name.replace("x-on:", "").replace("@", ""));
        }
        if (attr.name.startsWith("x-") && attr.name.includes("click")) {
          handlers.push("alpine-click");
        }
      }
      
      // Handle Lit/LitElement custom elements
      if (tagName.includes("-")) {
        // Custom elements always have a dash in their name
        handlers.push("custom-element");
      }
      
      // Handle Svelte framework
      const svelteClick = element.getAttribute("svelte-click") || element.getAttribute("on:click");
      if (svelteClick) {
        handlers.push("svelte-click");
      }
      
      // Handle Ember.js framework
      const emberAction = element.getAttribute("ember-action") || element.getAttribute("{{action");
      if (emberAction) {
        handlers.push("ember-action");
      }
      
      // Handle Knockout.js framework
      const koClick = element.getAttribute("data-bind");
      if (koClick && typeof koClick === 'string' && koClick.includes("click:")) {
        handlers.push("knockout-click");
      }
      
      // Handle Material Design / MDC attributes
      const mdcRipple = element.getAttribute("data-mdc-ripple-is-unbounded") || element.classList.contains("mdc-ripple-surface");
      if (mdcRipple) {
        handlers.push("mdc-interactive");
      }
      
      // Handle Bootstrap framework
      const bootstrapToggle = element.getAttribute("data-bs-toggle") || element.getAttribute("data-toggle");
      const bootstrapTarget = element.getAttribute("data-bs-target") || element.getAttribute("data-target");
      if (bootstrapToggle || bootstrapTarget) {
        handlers.push("bootstrap-interactive");
      }
      
      // Handle jQuery UI
      const jqueryUI = element.classList.contains("ui-button") || element.classList.contains("ui-widget");
      if (jqueryUI) {
        handlers.push("jquery-ui");
      }
      
      // Handle Tailwind CSS interactive classes
      const classList = element.classList || [];
      const tailwindInteractive = classList.contains("cursor-pointer") || 
                                 Array.from(classList).some(cls => cls.includes("hover:")) || 
                                 Array.from(classList).some(cls => cls.includes("focus:")) ||
                                 Array.from(classList).some(cls => cls.includes("active:"));
      if (tailwindInteractive) {
        handlers.push("tailwind-interactive");
      }
      if (tagName === "a") {
        const href = element.getAttribute("href");
        if (href) {
          if (href.startsWith("javascript:")) handlers.push("javascript-link");
          else if (href.startsWith("#")) handlers.push("anchor-link");
          else handlers.push("navigation");
        } else {
          // Some links might not have href but still be clickable
          handlers.push("clickable");
        }
      }
      if (tagName === "button") {
        const type = element.getAttribute("type");
        if (!type || type === "submit") handlers.push("form-submit");
        else if (type === "reset") handlers.push("form-reset");
        else handlers.push("clickable");
      }
      if (tagName === "form") handlers.push("form-submission");
      if (tagName === "input") {
        const inputType = element.getAttribute("type");
        if (["submit", "reset", "button"].includes(inputType)) handlers.push("clickable");
        else if (["radio", "checkbox"].includes(inputType)) handlers.push("toggle");
        else if (inputType === "file") handlers.push("file-select");
        else handlers.push("input-change");
      }
      if (tagName === "select") handlers.push("select-change");
      if (tagName === "textarea") handlers.push("input-change");
      if (tagName === "permission") handlers.push("permission-clickable");
      const role = element.getAttribute("role");
      if (role) {
        switch (role) {
          case "button": case "link": case "menuitem": handlers.push("clickable"); break;
          case "tab": handlers.push("tab-select"); break;
          case "checkbox": case "radio": handlers.push("toggle"); break;
          case "switch": case "slider": case "spinbutton": handlers.push("interactive"); break;
          case "combobox": case "listbox": case "option": handlers.push("selectable"); break;
          case "dialog": case "alertdialog": handlers.push("modal"); break;
          case "navigation": case "main": case "banner": handlers.push("landmark"); break;
          case "disclosure": case "tree": case "treeitem": handlers.push("expandable"); break;
          case "searchbox": case "textbox": handlers.push("inputable"); break;
          case "menubar": case "menu": case "menuitemcheckbox": case "menuitemradio": handlers.push("menu-interactive"); break;
          case "tooltip": case "alert": case "status": handlers.push("informational"); break;
          case "progressbar": case "meter": handlers.push("progress"); break;
          case "toolbar": case "tablist": case "tabpanel": handlers.push("container-interactive"); break;
          case "grid": case "gridcell": case "row": case "rowgroup": handlers.push("grid-interactive"); break;
          case "article": case "region": case "complementary": handlers.push("content-interactive"); break;
        }
      }
      
      // Handle ARIA state attributes that indicate interactivity
      const ariaExpanded = element.getAttribute("aria-expanded");
      const ariaSelected = element.getAttribute("aria-selected");
      const ariaChecked = element.getAttribute("aria-checked");
      const ariaPressed = element.getAttribute("aria-pressed");
      const ariaHidden = element.getAttribute("aria-hidden");
      const ariaDisabled = element.getAttribute("aria-disabled");
      const ariaHaspopup = element.getAttribute("aria-haspopup");
      const ariaControls = element.getAttribute("aria-controls");
      const ariaDescribedby = element.getAttribute("aria-describedby");
      const ariaLabelledby = element.getAttribute("aria-labelledby");
      
      if (ariaExpanded !== null) handlers.push("aria-expandable");
      if (ariaSelected !== null) handlers.push("aria-selectable");
      if (ariaChecked !== null) handlers.push("aria-checkable");
      if (ariaPressed !== null) handlers.push("aria-pressable");
      if (ariaHaspopup) handlers.push("aria-popup");
      if (ariaControls) handlers.push("aria-controller");
      
      // Handle modern CSS selectors that indicate interactivity
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.cursor === "pointer") handlers.push("cursor-pointer");
      if (computedStyle.userSelect === "none") handlers.push("user-select-none");
      if (computedStyle.pointerEvents === "none") return []; // Skip non-interactive elements
      
      // Handle CSS custom properties that might indicate interactivity
      const hasHoverEffect = computedStyle.getPropertyValue("--hover-color") || 
                           computedStyle.getPropertyValue("--hover-bg") ||
                           computedStyle.getPropertyValue("--hover-opacity");
      if (hasHoverEffect) handlers.push("css-hover-effect");
      
      // Handle pseudo-classes in CSS (check if element has hover/focus/active styles)
      const hasHoverStyle = element.matches(":hover") || element.matches(":focus") || element.matches(":active");
      if (hasHoverStyle) handlers.push("pseudo-class-interactive");
      if (element.hasAttribute("tabindex") && element.getAttribute("tabindex") !== "-1") {
        handlers.push("focusable");
      }
      return [...new Set(handlers)];
    };

    const getJSPath = (element) => {
      if (!(element instanceof Element)) return "";
      
      // Priority-based selector generation (ONLY technical selectors, NO human-readable text)
      
      // 1. Try ID (if it doesn't contain spaces or special chars that might be language-specific)
      if (element.id && /^[a-zA-Z0-9_-]+$/.test(element.id)) {
        return \`#\${CSS.escape(element.id)}\`;
      }
      
      // 2. Try data-testid or similar test attributes (ONLY technical values)
      const testId = element.getAttribute("data-testid") || 
                    element.getAttribute("data-test") || 
                    element.getAttribute("data-cy") || 
                    element.getAttribute("data-selenium-id");
      if (testId && /^[a-zA-Z0-9_-]+$/.test(testId)) {
        const attrName = element.getAttribute("data-testid") ? "data-testid" : 
                        element.getAttribute("data-test") ? "data-test" : 
                        element.getAttribute("data-cy") ? "data-cy" : "data-selenium-id";
        return \`[\${attrName}="\${testId}"]\`;
      }
      
      // 3. Try name attribute (forms elements - ONLY technical values)
      const name = element.getAttribute("name");
      if (name && /^[a-zA-Z0-9_-]+$/.test(name)) {
        return \`[name="\${name}"]\`;
      }
      
      // 4. Try type + value combination for inputs (ONLY if value is technical)
      const tagName = element.tagName.toLowerCase();
      if (tagName === "input") {
        const type = element.getAttribute("type");
        const value = element.getAttribute("value");
        if (type && value && /^[a-zA-Z0-9_-]+$/.test(value)) {
          return \`input[type="\${type}"][value="\${value}"]\`;
        }
        if (type) {
          return \`input[type="\${type}"]\`;
        }
      }
      
      // 5. Try class-based selectors (avoid human-readable classes)
      const classList = element.classList;
      if (classList && classList.length > 0) {
        const technicalClasses = Array.from(classList).filter(cls => {
          // Accept technical/framework classes, avoid human-readable ones
          return /^[a-zA-Z0-9_-]+$/.test(cls) && 
                 !cls.includes('text') && 
                 !cls.includes('title') && 
                 !cls.includes('label') && 
                 !cls.includes('message') &&
                 (cls.includes('btn') || cls.includes('form') || cls.includes('input') || 
                  cls.includes('control') || cls.includes('widget') || cls.includes('component') ||
                  cls.includes('ui-') || cls.includes('mdc-') || cls.includes('mat-') ||
                  cls.startsWith('v-') || cls.startsWith('ng-') || cls.startsWith('react-') ||
                  cls.length < 4); // Very short classes are usually technical
        });
        
        if (technicalClasses.length > 0) {
          const classSelector = technicalClasses.slice(0, 3).map(cls => \`.\${CSS.escape(cls)}\`).join('');
          try {
            const foundElements = document.querySelectorAll(classSelector);
            if (foundElements.length === 1 && foundElements[0] === element) {
              return classSelector;
            }
          } catch (e) {}
        }
      }
      
      // 6. Try role-based selectors
      const role = element.getAttribute("role");
      if (role && /^[a-zA-Z0-9_-]+$/.test(role)) {
        const roleSelector = \`[role="\${role}"]\`;
        try {
          const foundElements = document.querySelectorAll(roleSelector);
          if (foundElements.length === 1 && foundElements[0] === element) {
            return roleSelector;
          }
        } catch (e) {}
      }
      
      // 7. Try technical data attributes (NEVER human-readable ones)
      const technicalAttrs = ['data-id', 'data-key', 'data-index', 'data-value', 'data-type', 
                             'data-component', 'data-widget', 'data-control', 'data-element'];
      for (const attr of technicalAttrs) {
        const value = element.getAttribute(attr);
        if (value && /^[a-zA-Z0-9_-]+$/.test(value)) {
          return \`[\${attr}="\${value}"]\`;
        }
      }
      
      // 8. SKIP form-specific attributes like placeholder as they are often human-readable
      // We will not use placeholder, title, aria-label, etc.
      
      // 9. Build structural path (ONLY technical attributes, NO human-readable content)
      let path = [];
      let currentElement = element;
      while (currentElement && currentElement.parentElement && currentElement !== document.body) {
        let selector = currentElement.tagName.toLowerCase();
        
        // Add ONLY technical attributes (never human-readable ones)
        const type = currentElement.getAttribute("type");
        if (type && /^[a-zA-Z0-9_-]+$/.test(type)) {
          selector += \`[type="\${type}"]\`;
        }
        
        const name = currentElement.getAttribute("name");
        if (name && /^[a-zA-Z0-9_-]+$/.test(name)) {
          selector += \`[name="\${name}"]\`;
        }
        
        // Add ONLY technical classes (framework/component classes)
        const classList = currentElement.classList;
        if (classList && classList.length > 0) {
          const technicalClasses = Array.from(classList).filter(cls => {
            return /^[a-zA-Z0-9_-]+$/.test(cls) && 
                   (cls.includes('btn') || cls.includes('form') || cls.includes('input') || 
                    cls.includes('control') || cls.includes('ui-') || cls.includes('mdc-') ||
                    cls.startsWith('v-') || cls.startsWith('ng-') || cls.startsWith('react-') ||
                    cls.length < 4) && 
                   // EXCLUDE any class that might contain human-readable text
                   !cls.includes('text') && !cls.includes('title') && !cls.includes('label') &&
                   !cls.includes('message') && !cls.includes('description');
          });
          
          if (technicalClasses.length > 0) {
            selector += \`.\${technicalClasses[0]}\`;
          }
        }
        
        // Add positional info if needed
        if (currentElement.parentElement) {
          const siblings = Array.from(currentElement.parentElement.children);
          const similarSiblings = siblings.filter(
            (sibling) => sibling.tagName === currentElement.tagName
          );
          if (similarSiblings.length > 1) {
            const index = similarSiblings.indexOf(currentElement) + 1;
            selector += \`:nth-of-type(\${index})\`;
          }
        }
        
        path.unshift(selector);
        const testPath = path.join(" > ");
        try {
          const foundElements = document.querySelectorAll(testPath);
          if (foundElements.length === 1 && foundElements[0] === element) {
            return testPath;
          }
        } catch (e) {}
        currentElement = currentElement.parentElement;
      }
      
      // 10. Generate a unique technical data attribute as fallback
      const fallbackTestId = \`el-\${Math.random().toString(36).substring(2, 11)}\`;
      element.setAttribute("data-testid", fallbackTestId);
      return \`[data-testid="\${fallbackTestId}"]\`;
    };

    const determineElementType = (element, handlers) => {
      const tagName = element.tagName.toLowerCase();
      const type = element.getAttribute("type");
      const role = element.getAttribute("role");
      
      if (tagName === "input") {
        if (["text", "email", "password", "search", "tel", "url", "number"].includes(type)) return "writeable";
        if (["checkbox", "radio"].includes(type)) return "clickable";
        if (type === "file") return "uploadable";
        return "clickable";
      }
      if (["textarea", "select"].includes(tagName)) return "writeable";
      
      // Check for custom elements with JavaScript actions
      const hasJsAction = element.getAttribute('jsaction') || 
                         element.getAttribute('jscontroller') ||
                         element.getAttribute('data-click') ||
                         element.getAttribute('data-action');
      
      // Check for any interactive patterns
      const hasAnyInteractivePattern = element.getAttribute('data-delegate') ||
                                      element.getAttribute('data-handler') ||
                                      element.getAttribute('data-callback') ||
                                      element.getAttribute('data-track') ||
                                      element.getAttribute('data-share') ||
                                      element.getAttribute('data-modal') ||
                                      element.getAttribute('data-navigate') ||
                                      element.getAttribute('data-video') ||
                                      element.getAttribute('draggable') ||
                                      element.getAttribute('aria-expanded') ||
                                      element.getAttribute('aria-selected') ||
                                      element.getAttribute('aria-pressed');
      
      if (
        ["button", "a", "permission"].includes(tagName) ||
        ["button", "link", "menuitem"].includes(role) ||
        handlers.some((h) => ["click", "navigation", "form-submit", "clickable", "js-controller", "data-click", 
                              "stimulus-controller", "alpine-click", "custom-element", "mdc-interactive", 
                              "bootstrap-interactive", "tailwind-interactive", "aria-expandable", 
                              "aria-selectable", "aria-pressable", "cursor-pointer"].includes(h)) ||
        hasJsAction || hasAnyInteractivePattern
      ) {
        return "clickable";
      }
      return "other";
    };

    const results = [];
    const elements = document.querySelectorAll("body *");
    elements.forEach((element) => {
      // Check if element is actually visible and interactable
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      // Skip if element is not visible or has no dimensions
      if (rect.width === 0 && rect.height === 0) {
        return;
      }
      
      // Skip if element is explicitly hidden
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return;
      }
      const nativeHandlers = getNativeListeners(element);
      const reactHandlers = getReactHandlers(element);
      const angularHandlers = getAngularHandlers(element);
      const vueHandlers = getVueHandlers(element);
      
      // Additional check for common clickable elements that might not have explicit handlers
      const tagName = element.tagName.toLowerCase();
      const isCommonClickable = tagName === 'a' || tagName === 'button' || tagName === 'permission' ||
                               element.hasAttribute('onclick') || 
                               element.style.cursor === 'pointer' ||
                               element.getAttribute('role') === 'button' ||
                               element.getAttribute('role') === 'link';
      
      // Check for custom elements with JavaScript action handlers
      const hasJsAction = element.getAttribute('jsaction') || 
                         element.getAttribute('jscontroller') ||
                         element.getAttribute('data-click') ||
                         element.getAttribute('data-action') ||
                         element.getAttribute('data-event');
      
      // Check for elements with tabindex (often indicates interactive elements)
      const hasTabindex = element.hasAttribute('tabindex') && element.getAttribute('tabindex') !== '-1';
      
      // Check for elements with specific classes that might indicate interactivity
      const className = element.className || '';
      const classNameStr = typeof className === 'string' ? className : (className.toString ? className.toString() : '');
      const hasInteractiveClass = classNameStr.includes('clickable') || 
                                 classNameStr.includes('interactive') ||
                                 classNameStr.includes('btn') ||
                                 classNameStr.includes('link');
      
      // Check for comprehensive event delegation patterns
      const hasEventDelegation = element.getAttribute('data-delegate') ||
                                element.getAttribute('data-handler') ||
                                element.getAttribute('data-callback') ||
                                element.getAttribute('data-function') ||
                                element.getAttribute('data-method') ||
                                element.getAttribute('data-trigger') ||
                                element.getAttribute('data-onclick') ||
                                element.getAttribute('data-tap') ||
                                element.getAttribute('data-touch') ||
                                element.getAttribute('data-gesture');
      
      // Check for common CMS and framework patterns
      const hasCMSPattern = element.getAttribute('data-wp-click') || // WordPress
                           element.getAttribute('data-drupal-click') || // Drupal
                           element.getAttribute('data-joomla-click') || // Joomla
                           element.getAttribute('data-shopify-click') || // Shopify
                           element.getAttribute('data-magento-click') || // Magento
                           element.getAttribute('data-prestashop-click'); // PrestaShop
      
      // Check for analytics tracking patterns
      const onclickAttr = element.getAttribute('onclick');
      const hasAnalyticsPattern = element.getAttribute('data-track') ||
                                 element.getAttribute('data-analytics') ||
                                 element.getAttribute('data-gtm') ||
                                 element.getAttribute('data-ga') ||
                                 element.getAttribute('data-fb-pixel') ||
                                 element.getAttribute('data-mixpanel') ||
                                 element.getAttribute('data-segment') ||
                                 (onclickAttr && typeof onclickAttr === 'string' && onclickAttr.includes('track'));
      
      // Check for social media integration patterns
      const hasSocialPattern = element.getAttribute('data-share') ||
                              element.getAttribute('data-social') ||
                              element.getAttribute('data-facebook') ||
                              element.getAttribute('data-twitter') ||
                              element.getAttribute('data-linkedin') ||
                              element.getAttribute('data-instagram') ||
                              element.getAttribute('data-youtube') ||
                              element.getAttribute('data-tiktok');
      
      // Check for e-commerce patterns
      const hasEcommercePattern = element.getAttribute('data-product') ||
                                 element.getAttribute('data-cart') ||
                                 element.getAttribute('data-checkout') ||
                                 element.getAttribute('data-payment') ||
                                 element.getAttribute('data-add-to-cart') ||
                                 element.getAttribute('data-buy-now') ||
                                 element.getAttribute('data-wishlist') ||
                                 element.getAttribute('data-compare');
      
      // Check for form enhancement patterns
      const hasFormPattern = element.getAttribute('data-validate') ||
                            element.getAttribute('data-submit') ||
                            element.getAttribute('data-form') ||
                            element.getAttribute('data-field') ||
                            element.getAttribute('data-input') ||
                            element.getAttribute('data-autocomplete') ||
                            element.getAttribute('data-typeahead') ||
                            element.getAttribute('data-select2') ||
                            element.getAttribute('data-chosen');
      
      // Check for modal/dialog patterns
      const hasModalPattern = element.getAttribute('data-modal') ||
                             element.getAttribute('data-dialog') ||
                             element.getAttribute('data-popup') ||
                             element.getAttribute('data-overlay') ||
                             element.getAttribute('data-lightbox') ||
                             element.getAttribute('data-fancybox') ||
                             element.getAttribute('data-magnificpopup');
      
      // Check for navigation patterns
      const hasNavigationPattern = element.getAttribute('data-navigate') ||
                                  element.getAttribute('data-link') ||
                                  element.getAttribute('data-url') ||
                                  element.getAttribute('data-href') ||
                                  element.getAttribute('data-route') ||
                                  element.getAttribute('data-page') ||
                                  element.getAttribute('data-redirect');
      
      // Check for multimedia patterns
      const hasMultimediaPattern = element.getAttribute('data-video') ||
                                  element.getAttribute('data-audio') ||
                                  element.getAttribute('data-play') ||
                                  element.getAttribute('data-pause') ||
                                  element.getAttribute('data-stop') ||
                                  element.getAttribute('data-seek') ||
                                  element.getAttribute('data-volume') ||
                                  element.getAttribute('data-player');
      
      // Check for drag-and-drop patterns
      const hasDragPattern = element.getAttribute('draggable') ||
                            element.getAttribute('data-drag') ||
                            element.getAttribute('data-drop') ||
                            element.getAttribute('data-sortable') ||
                            element.getAttribute('data-droppable') ||
                            element.getAttribute('data-draggable');
      
      // Check for accessibility patterns
      const hasA11yPattern = element.getAttribute('aria-live') ||
                            element.getAttribute('aria-atomic') ||
                            element.getAttribute('aria-relevant') ||
                            element.getAttribute('aria-busy') ||
                            element.getAttribute('aria-owns') ||
                            element.getAttribute('aria-flowto') ||
                            element.getAttribute('aria-activedescendant');
      
      if (nativeHandlers.length || reactHandlers.length || angularHandlers.length || vueHandlers.length || 
          isCommonClickable || hasJsAction || hasTabindex || hasInteractiveClass || 
          hasEventDelegation || hasCMSPattern || hasAnalyticsPattern || hasSocialPattern || 
          hasEcommercePattern || hasFormPattern || hasModalPattern || hasNavigationPattern || 
          hasMultimediaPattern || hasDragPattern || hasA11yPattern) {
        const allHandlers = [...new Set([...nativeHandlers, ...reactHandlers, ...angularHandlers, ...vueHandlers])];
        const elementType = determineElementType(element, allHandlers);
        
        if (elementType === 'other') return;
        
        // Get element text and filter out problematic elements
        const elementText = getCleanText(element);
        
        // Skip elements with excessive script-like content or empty containers
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'div' || tagName === 'span') {
          // For generic containers, be more selective
          const hasDirectContent = elementText && elementText.length > 0 && elementText.length < 500;
          const hasSpecificIdentifier = element.id || 
                                       (element.className && typeof element.className === 'string') ||
                                       element.getAttribute('role') ||
                                       hasJsAction;
          
          // Skip generic divs/spans without clear purpose or with too much content
          if (!hasDirectContent && !hasSpecificIdentifier) {
            return;
          }
          
          // Skip if it's likely a container with mostly script content
          if (elementText && (elementText.includes('window.') || elementText.includes('function('))) {
            return;
          }
        }

        const elementInfo = {
          selector: getJSPath(element),
          type: elementType,
          tag: element.tagName.toLowerCase(),
          id: element.id || undefined,
          text: elementText || undefined,
        };
        results.push(elementInfo);
      }
    });
    return results;
  })()
`;