module.exports = {
  "*.{vue,css,scss}": ["stylelint **/*.{html,vue,css,scss} --fix"],
  "*.{ts,js,vue}": ["prettier --write", "eslint --fix", "eslint"]
};
