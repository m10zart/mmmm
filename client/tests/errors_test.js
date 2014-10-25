Tinytest.add("Errors - collection", function(test) {
  // starting error collection has no errors
  test.equal(Errors.collection.find({}).count(), 0);
  
  // error collection has an error
  Errors.throw('A new error!');
  test.equal(Errors.collection.find({}).count(), 1);
  
  // error collection has no errors after removal
  Errors.collection.remove({});
  test.equal(Errors.collection.find({}).count(), 0);
});

Tinytest.addAsync("Errors - template", function(test, done) {
  // error gets removed from collection after 3000 milliseconds
  Errors.throw('A new error!');
  test.equal(Errors.collection.find({}).count(), 1);
  UI.insert(UI.render(Template.errors), document.body);
  Meteor.setTimeout(function() {
    test.equal(Errors.collection.find({}).count(), 0);
    done(); // end the test
  }, 3500);
});