class Template {
  replace = (templateString, parameters) => {
    if (!parameters || typeof templateString !== 'string') {
      return templateString;
    }
    return templateString.replace(/{{(.*?)}}/g, (match, key) => {
      const keys = key.trim().split(".");
      let value = parameters;
      for (const k of keys) {
        if (value === undefined || value === null) {
          return match; 
        }
        value = value[k];
      }
      return value !== undefined && value !== null ? String(value) : match;
    });
  };
}

export default new Template();
