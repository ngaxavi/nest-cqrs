module.exports = {
  branches: ['main'],
  prepare: [
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
  ],
  publish: [
    '@semantic-release/github',
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
  ],
  verifyConditions: [
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    '@semantic-release/github',
  ],
  success: false,
  fail: false,
};
