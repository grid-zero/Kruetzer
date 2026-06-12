module.exports = {
  layout: "base.html",
  eleventyComputed: {
    permalink: (data) => `${data.page.fileSlug || "index"}.html`,
  },
};
