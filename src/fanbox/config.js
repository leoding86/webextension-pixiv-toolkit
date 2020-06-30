export default {
  post_url: 'https://api.fanbox.cc/post.info?postId={post_id}',
  post_url_pattern: /^https:\/\/(?:www\.)?fanbox\.cc\/@([a-z\d_-]+)\/posts\/([\d]+)/i,
  post_url_pattern2: /^https:\/\/([a-z\d_-]+\.)?fanbox\.cc\/posts\/([\d]+)/i,
  image_url: 'https://downloads.fanbox.cc/images/post/{post_id}/{image_id}.{image_ext}',
};
