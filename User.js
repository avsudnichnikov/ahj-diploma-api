class User {
  static username = 'Vasya';
  static password = 'Vasya';

  static find(username, password) {
    if (username !== this.username || password !== this.password) {
      console.log(username);
      throw new Error(username + ' is not registered');
    }
    return {
      username,
    };
  }
}

module.exports = User;
