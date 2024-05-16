let getUserByEmail = function(email, database) {
  // lookup magic...
  let result = undefined;
  for (let userId in database) {
    if (database[userId].email === email) {
      result = database[userId];
    }
  }
  return result;
};

module.exports = { getUserByEmail };