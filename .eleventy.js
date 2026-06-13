const postcss = require('postcss');
const postcssImport = require('postcss-import');
const fs = require('fs');
const path = require('path');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/index.js");

  // Bundle CSS @imports into single file after passthrough copy
  eleventyConfig.on('afterBuild', () => {
    const cssDir = path.join(__dirname, '_site', 'css');
    const entryPath = path.join(cssDir, 'index.css');
    const css = fs.readFileSync(entryPath, 'utf8');

    return postcss([postcssImport()])
      .process(css, { from: entryPath, to: entryPath })
      .then(result => fs.writeFileSync(entryPath, result.css))
      .catch(err => console.error('CSS bundling failed:', err));
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
  };
};
