// check that userId specified owns documents
ownsDocument = function(userId, doc) {
  return doc && doc.userId === userId;
}