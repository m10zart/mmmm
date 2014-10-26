Comments = new Meteor.Collection('comments');

Meteor.methods({
  commentInsert: function(commentAttributes) {
    check(this.userId, String);
    check(commentAttributes, {
      postId: String,
      body: String
    });

    var user = Meteor.user();
    var post = Posts.findOne(commentAttributes.postId);

    if (!post)
      throw new Meteor.Error('invalid-comment', 'You must comment on a post');

    var comment = _.extend(commentAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });

    // update post with number of comments
    Posts.update(comment.postId, {$inc: {commentsCount: 1}});

    // create comment, save id
    comment._id = Comments.insert(comment);

    // create notification, informing post user that there's been a comment
    createCommentNotification(comment);

    return comment._id;
  }
});