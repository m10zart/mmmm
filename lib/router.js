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
  sort: { submitted: -1 },
  onBeforeAction: function() {
    this.postsSub = Meteor.subscribe('posts', this.sort, this.postsLimit());
  },
  posts: function() {
    return Posts.find({}, {sort: this.sort, limit: this.postsLimit()});
  },
  data: function() {
    var hasMore = this.posts().count() === this.postsLimit();
    var nextPath = this.route.path({postsLimit: this.postsLimit() + this.increment});
    return {
      posts: this.posts(),
      ready: this.postsSub.ready,
      nextPath: hasMore ? nextPath : null
    };
  }
});

// ===== Router Map =====
Router.map(function() {
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

  this.route('postsList', {
    path: '/:postsLimit?',
    controller: PostsListController
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