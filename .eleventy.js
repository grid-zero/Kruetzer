module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/index.js");

  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
  };
};
