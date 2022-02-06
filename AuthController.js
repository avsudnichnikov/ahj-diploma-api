const User = require('./User');
const { v4: uuidv4 } = require('uuid');

class AuthController {
  constructor() {
    this.tokens = [];
  }

  auth( username, password ) {
    try {
      User.find(username, password);
      const token = uuidv4();
      this.tokens.push(token);
      return {
        data: { username, token },
        code: 'success',
      };
    } catch (e) {
      return {
        errors: {
          username: e.message,
        },
        code: 'invalid',
      };
    }
  }

  validateToken(token) {
    if(this.tokens.includes(token)){
      return true
    }
    return false;
  }
}

module.exports = AuthController;
