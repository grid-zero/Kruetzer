const markdownIt = require('markdown-it');
const postcss = require('postcss');
const postcssImport = require('postcss-import');
const fs = require('fs');
const path = require('path');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css/*.css");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/index.js");
  eleventyConfig.addPassthroughCopy("src/admin");

  eleventyConfig.setLiquidOptions({
    outputEscape: "escape"
  });

  // Developer docs co-located with the CSS — keep them in the repo, not the built site
  eleventyConfig.ignores.add("src/css/README.md");
  eleventyConfig.ignores.add("src/admin/index.html");

  eleventyConfig.addFilter("relativePath", function(value){
    return value.replace(/^\//, "");
  });

  // Whole dollars stay whole ($1,120); anything with cents shows two places ($57.50)
  eleventyConfig.addFilter("aud", function (value) {
    const cents = Number.isInteger(value) ? 0 : 2;
    return "$" + value.toLocaleString("en-AU", { minimumFractionDigits: cents, maximumFractionDigits: cents });
  });

  // CMS markdown fields (e.g. FAQ answers). html: false escapes any raw HTML typed into
  // the CMS, so the output is safe to print with `| raw`.
  const md = markdownIt({ html: false });
  eleventyConfig.addFilter("markdown", function (value) {
    return md.render(value || "");
  });

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
    markdownTemplateEngine: "liquid"
  };
};
