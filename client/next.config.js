module.exports = {
  webpackDevMiddleware: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
  env: {
    stripe_pk_key: process.env.STRIPE_PUBLISHABLE_KEY,
  },
};
