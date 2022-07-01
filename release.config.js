module.exports = {
    "branches": [
      'main'
    ],
    "prepare": [
      "@semantic-release/changelog",
      [
        "@semantic-release/npm",
        {
          "npmPublish": false
        }
      ],
      {
        "path": "@semantic-release/git",
        "message": "chore: release ${nextRelease.version}\n\n${nextRelease.notes}"
      }
    ],
    "publish": [
      "@semantic-release/github",
      [
        "@semantic-release/npm",
        {
          "npmPublish": false
        }
      ]
    ],
    "verifyConditions": [
      [
        "@semantic-release/npm",
        {
          "npmPublish": false
        }
      ],
      "@semantic-release/github"
    ],
    "success": false,
    "fail": false
  };