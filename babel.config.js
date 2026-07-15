module.exports = function (api) {
  api.cache(true);
  const plugins = [];

  // 本番ビルドでは console.log を削除
  if (process.env.NODE_ENV === 'production') {
    plugins.push('transform-remove-console');
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
