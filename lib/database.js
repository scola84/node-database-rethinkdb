'use strict';

const EventHandler = require('@scola/events');

class Database extends EventHandler {
  constructor(rethinkdb) {
    super();
    this.rethinkdb = rethinkdb;
  }

  connect(options) {
    return this
      .rethinkdb
      .connect(options)
      .then(this.handleConnect.bind(this))
      .catch(this.handleError.bind(this));
  }

  handleConnect(connection) {
    this.connection = connection;
    return this;
  }

  read(query, request) {
    return this
      .execute(query, request)
      .then(this.handleRead.bind(this, request));
  }

  write(query, request) {
    return this
      .execute(query, request)
      .then(this.handleWrite.bind(this, request));
  }

  execute(query, request) {
    return query(this.rethinkdb, request)
      .run(this.connection)
      .catch(this.handleError.bind(this));
  }

  handleRead(request, result) {
    if (result && result.toArray) {
      return result
        .toArray()
        .then(this.handleArray.bind(this));
    }

    return result;
  }

  handleWrite(request, result) {
    if (result.changes) {
      return result.changes[0].new_val;
    }

    if (result.generated_keys) {
      request.values.id = result.generated_keys[0];
    }

    return request.values;
  }

  handleArray(result) {
    return result;
  }

  handleError(error) {
    this.emit('error', {
      error
    });

    return Promise.reject(new Error('@scola.model.database'));
  }
}

module.exports = Database;
