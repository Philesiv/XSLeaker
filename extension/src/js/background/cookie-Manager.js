function getCookiesForTab(tab, callback) {
  chrome.cookies.getAll({ url: tab.url }, (cookies) => {
    const cookieProps = {
      unspecified: 0,
      no_restriction: 0,
      lax: 0,
      strict: 0,
    };
    if (cookies.length > 0) {
      for (const cookie of cookies) {
        cookieProps[cookie.sameSite] += 1;
      }
    }
    callback(cookieProps);
  });
}

export { getCookiesForTab };
