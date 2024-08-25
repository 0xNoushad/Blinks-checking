/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
 
module.exports = {
    webpack: (config) => {
      config.cache = false; // Disable cache for debugging purposes
      return config;
    },
  };
  