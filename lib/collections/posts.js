Posts = new Mongo.Collection('posts');

// allow() methods
Posts.allow({
  update: function(userId, post) { return ownsDocument(userId, post); }, // make a meteor method out of update to check for duplicate links!
  remove: function(userId, post) { return ownsDocument(userId, post); }
});

// deny() methods, if any is true, deny update
Posts.deny({
  // ensure users can only edit specific fields
  update: function(userId, post, fieldNames) {
    // may only edit following two fields
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});
Posts.deny({
  // in addition to validating on client, validate on server to avoid people using console to call to server directly
  update: function(userId, post, fieldNames) {
    var errors = validatePost(modifier.$set);
    return errors.title || errors.url;
  }
});

// validate post object
validatePost = function(post) {
  var errors = {};
  
  if (!post.title) 
    errors.title = "Please fill in a headline";
  if (!post.url)
    errors.url = "Please fill in a URL";
  
  return errors;
}

// only run on server
Meteor.methods({
  postInsert: function(postAttributes) {
    check(Meteor.userId(), String);
    check(postAttributes, {
      title: String,
      url: String
    });
    
    var errors = validatePost(postAttributes);
    if (errors.title || errors.url)
      throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");
    
    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {
        postExists: true,
        _id: postWithSameLink._id
      }
    }
    
    var user = Meteor.user();
    var post = _.extend(postAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      commentsCount: 0,
      upvoters: [],
      votes: 0
    });
    
    var postId = Posts.insert(post);
    
    return { _id: postId };
  },

  upvote: function(postId) {
    check(this.userId, String);
    check(postId, String);

    var affected = Posts.update({
      _id: postId,
      upvoters: {$ne: this.userId}
    }, {
      $addToSet: {upvoters: this.userId},
      $inc: {votes: 1}
    });

    if (!affected) {
      throw new Meteor.Error('invalid', "You weren't able to upvote that post");
    }
  }
});