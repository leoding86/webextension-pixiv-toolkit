export default [
  {
    type: 'pixiv_illust',
    patterns: [
      /^https:\/\/www\.pixiv\.net\/([a-z\d]+\/)?artworks\/(\d+)/i,
      // https://www.pixiv.net/artworks/unlisted/eE3fTYaROT9IsZmep386
      /^https:\/\/www\.pixiv\.net\/([a-z\d]+\/)?artworks\/(unlisted)\/([a-z\d]+)/i
    ],
  },
  {
    type: 'pixiv_novel',
    patterns: [
      /^https:\/\/www\.pixiv\.net\/([a-z\d]+\/)?novel\/show\.php\?id=(\d+)/i
    ],
  },
  {
    type: 'pixiv_comic_episode',
    patterns: [
      /https:\/\/comic\.pixiv\.net\/viewer\/stories\/(\d+)/i
    ],
  },
  {
    type: 'fanbox_post',
    patterns: [
      /^https:\/\/(?:www\.)?fanbox\.cc\/@[a-z\d_-]+\/posts\/([\d]+)/i,
      /^https:\/\/([a-z\d_-]+\.)?fanbox\.cc\/posts\/([\d]+)/i
    ],
  },
];
