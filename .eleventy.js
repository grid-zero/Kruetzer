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

  // Absolute URL for link previews / canonical / sitemap: `{{ path | absoluteUrl: studio.site_url }}`.
  // site_url is CMS-editable, so tolerate a missing trailing slash (without it, URL
  // resolution would drop the /Kruetzer/ project folder) and fail the build if it's
  // blank or not a web address, rather than deploy previews that point nowhere.
  function absoluteUrl(value, base) {
    if (!/^https?:\/\/\S+$/.test((base || "").trim())) {
      throw new Error(`studio.site_url must be a full web address, got "${base}"`);
    }
    base = base.trim().replace(/\/?$/, "/");
    return new URL(String(value || "").replace(/^\//, ""), base).href;
  }
  eleventyConfig.addFilter("absoluteUrl", absoluteUrl);

  // Search-engine description of the studio (schema.org JSON-LD), built from studio.json.
  // Output with `| raw` inside <script type="application/ld+json">: HTML-escaping would
  // break the JSON, so instead `<` is escaped as \u003c and nothing can close the script tag.
  eleventyConfig.addFilter("structuredData", function (studio, description) {
    const base = absoluteUrl("", studio.site_url);
    const data = {
      "@context": "https://schema.org",
      "@type": "MusicSchool",
      name: "Kreutzer",
      url: base,
      logo: absoluteUrl("assets/apple-touch-icon.png", base),
      image: absoluteUrl("assets/share/default.jpg", base),
      description,
      email: studio.email,
      foundingDate: "2025",
      address: {
        "@type": "PostalAddress",
        addressLocality: studio.area,
        addressRegion: "ACT",
        addressCountry: "AU",
      },
      areaServed: { "@type": "City", name: "Canberra" },
      sameAs: [studio.instagram, studio.facebook, studio.youtube].filter(Boolean),
    };
    if (!data.sameAs.length) delete data.sameAs;
    return JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
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
