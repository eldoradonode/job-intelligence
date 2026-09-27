/** @type {import("next").NextConfig} */
const nextconfig = {
  typescript: {
    ignorebuilderrors: true,
  },
  eslint: {
    ignoreduringbuilds: true,
  },
};

module.exports = nextconfig;
