Template.header.helpers({
  activeRouteClass: function(/* route names */) {
    var args = Array.prototype.slice.call(arguments, 0); // convert arguments object to regular JS array
    args.pop(); // get rid of hash added at end by Spacebars

    var active = _.any(args, function(name) {
      return Router.current() && Router.current().route.name === name; // check if corresponding URL matches current path
    });

    return active && 'active';
  }
});