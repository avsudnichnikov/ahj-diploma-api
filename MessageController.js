class MessageController {
  constructor() {
    this.messages = [];
  }

  add(text) {
    const message = {
      text,
      date: new Date(),
    }
    this.messages.push(message);
    return message;
  }

  list(offset = 0, limit = 10) {
    const l = this.messages.slice(this.messages.length - limit - offset, this.messages.length - offset);
    return l;
  }
}

module.exports = MessageController;
