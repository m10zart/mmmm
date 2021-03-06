Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading', // the template used by the loading hook.
  notFoundTemplate: 'notFound', // the template used by the dataNotFound hook -- renders if the data() function returns something falsey.
  waitOn: function() {
    return [Meteor.subscribe('notifications')];
  }
});

// ===== Route Controller =====
PostsListController = RouteController.extend({
  template: 'postsList',
  increment: 5,
  postsLimit: function() {
    return parseInt(this.params.postsLimit) || this.increment;
  },
  onBeforeAction: function() {
    this.postsSub = Meteor.subscribe('posts', this.sort, this.postsLimit());
  },
  posts: function() {
    return Posts.find({}, {sort: this.sort, limit: this.postsLimit()});
  },
  data: function() {
    var hasMore = this.posts().count() === this.postsLimit();
    return {
      posts: this.posts(),
      ready: this.postsSub.ready,
      nextPath: hasMore ? this.nextPath() : null
    };
  }
});

NewPostsListController = PostsListController.extend({
  sort: {submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.newPosts.path({postsLimit: this.postsLimit() + this.increment});
  }
});

BestPostsListController = PostsListController.extend({
  sort: {votes: -1, submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.bestPosts.path({postsLimit: this.postsLimit() + this.increment});
  }
});

// ===== Router Map =====
Router.map(function() {
  this.route('home', {
    path: '/',
    controller: NewPostsListController
  });

  this.route('newPosts', {
    path: '/new/:postsLimit?',
    controller: NewPostsListController
  });

  this.route('bestPosts', {
    path: '/best/:postsLimit?',
    controller: BestPostsListController
  });

  this.route('postEdit', {
    path: '/posts/:_id/edit',
    waitOn: function() {
      return Meteor.subscribe('singlePost', this.params._id);
    },
    data: function() { return Posts.findOne(this.params._id); }
  });

  this.route('postPage', {
    path: '/posts/:_id',
    waitOn: function() {
      return [
        Meteor.subscribe('singlePost', this.params._id),
        Meteor.subscribe('comments', this.params._id)
      ]
    },
    data: function() { return Posts.findOne(this.params._id); }
  });

  this.route('postSubmit', {
    path: '/submit'
  });
});

var requireLogin = function(pause) {
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
       this.render('accessDenied');
    }
    pause();
  }
};

// hooks
Router.onBeforeAction('loading');
Router.onBeforeAction('dataNotFound', {only: 'postPage'});
Router.onBeforeAction(requireLogin, {only: 'postSubmit'});