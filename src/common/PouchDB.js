import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'

const global = window !== undefined ?
  window :
  self !== undefined ?
    self : global;

global.PouchDB = PouchDB;
global.PouchDBFind = PouchDBFind;

export default PouchDB;
