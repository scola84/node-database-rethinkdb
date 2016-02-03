'use strict';

const rethinkdb = require('rethinkdb');
const DI = require('@scola/di');
const Database = require('./lib/database.js');

class Module extends DI.Module {
  configure() {
    this.inject(Database).with(
      this.value(rethinkdb)
    );
  }
}

module.exports = {
  Database,
  Module
};
