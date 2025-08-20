const { logger } = require("./logger");

function validateUrl(urlString) {
  try {
    const url = new URL(urlString);

    const isValidNaverUrl =
      url.hostname.includes("shopping.naver.com") ||
      url.hostname.includes("search.shopping.naver.com");

    if (!isValidNaverUrl) {
      logger.warn(`Invalid domain: ${url.hostname}`);
      return false;
    }

    return true;
  } catch (error) {
    logger.error(`URL validation failed: ${error}`);
    return false;
  }
}

function validateNumber(value) {
  if (!value) return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

function validatePages(pagesString, maxPages = 50) {
  if (!validateNumber(pagesString)) {
    return null;
  }

  const pages = parseInt(pagesString, 10);

  if (pages <= 0) {
    return null;
  }

  if (pages > maxPages) {
    return maxPages;
  }

  return pages;
}

function validateRequest(url, pages) {
  const errors = [];
  let validatedUrl;
  let validatedPages = 20;

  if (!url) {
    errors.push("URL parameter is required");
  } else {
    if (validateUrl(url)) {
      validatedUrl = url;
    } else {
      errors.push("Invalid Naver URL format");
    }
  }

  if (pages) {
    const pagesResult = validatePages(pages);
    if (pagesResult === null) {
      errors.push("Invalid pages parameter");
    } else {
      validatedPages = pagesResult;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedUrl,
    validatedPages,
  };
}

module.exports = {
  validateUrl,
  validateRequest,
};
