/*
uses REST-type calls to AirTable
see gcloudSQL version for MySQL version of this
Functions in File
getClausesBySection - call getJRecs to get all data in tableS ('clauses2' eg) matching section
getContactByID - call getJRecs to get all data in 'contacts' matching contactID
getSpaceOrRentByID - takes a spaceID (needs to exist!) and a table name (could be 'spaces' or 'proposed rent') and returns the record(s) that go with that; called by handleBaseRent and handlePremises
getJRecs - takes a table name and a search string and returns json.records
logGetClausefromDB - Use atSelector to query DB matching to find ClauseSelector
getRecordsfromDBbySection -  get all the clauses from the DB database that match the section
*/


/**
 * Purpose: call getJRecs to get all data in tableS ('clauses2' eg) matching section
 * 
 * @param {String} section - subset of the database
 * @param {String} tableS - table to search; allows swapping clause tables
 * @return {Object} jsonrecs- DB data matching section 
 */
const logGetClausesBySection = false;
function getClausesBySection(section, tableS) {
  var fS = "getClausesBySection";
  var errS = `section: ${section}`;
  try {
    var jsonrecs = getJRecs(tableS, section);
  }
  catch (err) {
    throw new Error(`${fS}: problem with ${errS}: error: ${err}`);
  }
  if (jsonrecs.length == 0) { throw new Error(`${fS}:  ${errS} record not found`) }
  return (jsonrecs);
}

/**
 * Purpose: call getJRecs to get all data in 'contacts' matching contactID
 *
 * @param  {Number} contactID - integer for contact
 * @return {Object[]} json.records - records from DB; or throws error
 */

function getContactByID(contactID) {
  var fS = "getContactByID";
  var errS = `contact: ${contactID}`;
  try {
    jsonrecs = getJRecs("contacts", contactID);
  }
  catch (err) {
    throw new Error(`${fS}: problem with ${errS}: error: ${err}`);
  }
  if (jsonrecs.length == 0) { throw new Error(`${fS}:  ${errS} record not found`) }
  //console.log(jsonrecs);
  return (jsonrecs);
}


/**
 * Purpose: takes a spaceID (needs to exist!) and a table name 
 * (could be 'spaces' or 'proposed rent') and returns the record(s) 
 * that go with that; called by handleBaseRent and handlePremises
 *
 * @param  {Number} spaceID - identifier for a space
 * @param  {String} tableS - table name: "spaces","proposedrent"
 * @return {Object[]} json.records - records from DB; or throws error
 */
function getBySpaceID(spaceID, tableS) {
  var fS = "getBySpaceID";
  var errS = `id: ${spaceID} / table: ${tableS}`;
  try {
    var jsonrecs = getJRecs(tableS, spaceID);
  }
  catch (err) {
    throw new Error(`${fS}: problem with ${errS}: error: ${err}`);
  }
  if (jsonrecs.length == 0) { throw new Error(`${fS}:  ${errS} record not found`) }
  return (jsonrecs);
}


/*
 * Purpose: takes a table name and a search string and returns json.records
 *
 * @param  {String} tableNameS - database table name
 * @param  {String} searchS - string to search the database table for 
 * @return {json[]} json.records - array of records in json format
 */
 
var logGetJRecs = false;
function getJRecs(tableNameS, searchS) {
  var logLoc = logGetJRecs;  // change to log name
  var fS = "getJRecs";

  switch (tableNameS) {
    case "spacesbuildingcontacts":
      fieldS = "space_identity";
      break;
    case "tourbook":
      fieldS = "SpaceID";
      break;
    case "contacts":
      fieldS = "ContactID";
      break;
    case "spaces":
      fieldS = "SpaceID";
      break;
    case "proposedrent":
      fieldS = "TourBookIndex";
      break;
    case "clauses":
      fieldS = "Section"
      break;
    case "clauses2":
      fieldS = "Section";
      break;

    default:
      break;
  }
  var root = 'https://api.airtable.com/v0';
  var baseId = 'appK6lLzo28seB5uR';
  var tableName = encodeURIComponent(tableNameS);
  var filter = "?filterByFormula=%7B" + fieldS + "%7D%3D" + "'" + searchS + "'";
  var endpoint = root + '/' + baseId + '/' + tableName + filter;
  // console.log(endpoint);
  var params = {
    'method': 'GET',
    'muteHttpExceptions': true,
    'headers': {
      'Authorization': 'Bearer ' + API_KEY,
    }
  };
  try {
    var response = UrlFetchApp.fetch(endpoint, params);
    var data = response.getContentText();
    var json = JSON.parse(data);
  }
  catch (err) {
    throw new Error(`${fS}: got ${err}`)
  }
  if(logGetJRecs) {console.log(json.records)}
  return (json.records);
}

/** Utility Function
 * Use atSelector to query DB matching to find ClauseSelector
 * Example selector: "What is the Operating Expense Stop?""
 * Section is one of: 
 *  OperatingExpenses
 *  Electric
 *  RealEstateTaxes
 *  Called by testDB(), testGetClause(), nobody else??
 * 
 * @param  {String} aSelector - clause selector, to access DB database field ClauseSelector
 * @param {String} section - DB database field Section
 * @return {Object} selClause - clause object
 */
var logGetClausefromDB = false;
function getClausefromDB(aSelector, section, tableS) {
  var logLoc = logGetClausefromDB;  // change to log name
  var fS = "getClausefromDB";
  var errS = "unknown_error";

  var recordsA = getClausesBySection(section, tableS);
  var records = recordsA.map(function (record) {
    return record.fields;
  });
  for (var j = 0; j < records.length; j++) {
    var record = records[j];
    if (record.ClauseSelector == aSelector) {
      return record
    }
  }
  throw new Error(`${fS}: no record that matches selector: ${aSelector}`);
}

/**
 * Purpose: get all the clauses from the DB database that match the section
 * 
 * @param  {String} section - name of one of the sections
 * @return {Object[]} cluase - return an array of clauses that match the section
 */

var logGetRecordsfromDBbySection = false;
function getRecordsfromDBbySection(section, tableS) {
  var logLoc = logGetRecordsfromDBbySection;  // change to log name
  var fS = "getRecordsfromDBbySection";
  var errS = "unknown_error";

  var recordA = getClausesBySection(section, tableS);
  var records = recordA.map(function (record) {
    return record.fields
  });
  if (records.length >= 1) {
    return records
  }
  throw new Error(`${fS}: no record that matches selector: ${section}`);
}



