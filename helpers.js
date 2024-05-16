const getUserByEmail = function(email, database) {
  // lookup magic...
  let result = false;
  for (let userId in database) {
    if (database[userId].email === email) {
      result = true;
    }
  }
  return result;
};

module.exports = { getUserByEmail };