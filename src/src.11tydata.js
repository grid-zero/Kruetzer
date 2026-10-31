module.exports = {
  layout: "base.html",
  eleventyComputed: {
    permalink: (data) => data.permalink || `${data.page.fileSlug || "index"}.html`,
  },
};
