'use strict';

const lodashGet = require('lodash.get');
const lodashHas = require('lodash.has');

const EventHandler = require('@scola/events');

class Database extends EventHandler {
  constructor(queries, rethinkdb) {
    super();

    this.queries = queries;
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

  read(name, data) {
    return this
      .query(name, data)
      .then(this.handleRead.bind(this, data));
  }

  write(name, data) {
    return this
      .query(name, data)
      .then(this.handleWrite.bind(this, data));
  }

  query(name, data) {
    if (!lodashHas(this.queries, name)) {
      return this.handleError(
        new Error('Query ' + name + ' does not exist')
      );
    }

    return lodashGet(this.queries, name)(this.rethinkdb, data)
      .run(this.connection)
      .catch(this.handleError.bind(this));
  }

  handleRead(data, result) {
    if (!result) {
      console.log('Empty result set');
    }

    if (result && result.toArray) {
      return result
        .toArray()
        .then(this.handleArray.bind(this));
    }

    return result;
  }

  handleWrite(data, result) {
    if (result.changes) {
      return result.changes[0].new_val;
    }

    if (result.generated_keys) {
      data.values.id = result.generated_keys[0];
    }

    return data.values;
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
