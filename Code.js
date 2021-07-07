// Type control-option-command G to invoke macro to copy and update git
// Renamed APPLES 210530
/* added a clone of this to clasp*/
/*
Handler function List
*********************
  handleOE(form, docInstance) reworked 210530
  handleRET(form, docInstance)
  handleElec(form, docInstance)
  handleUse(form, docInstance)
  handleTenantName(form, docInstance)
  handleTenantImprovements(form, docInstance)
  handleDates(form, docInstance)
  handleLandlordBroker(form, docInstance, contactID)
  handlePremises(form, docInstance, spaceID)
  handleBaseRent(docInstance, sID)
  handleParking(form, docInstance, respInstance, tableS)
  handleParkingOutsideNYC(parkingform,docInstance,tableS)
  handleSFBroker(form, docInstance, emailSG)
  handleSecurity(form,docInstance,respInstance,tableS)
*/

/*****************GLOBAL variables ************************************ */

const form = FormApp.openById('1TGBFjQy5LQ_iyAlg_FU7WzSNvZaHbkPE-8TLr8o4RvA');
const parkform = FormApp.openById('1ej5P0jwVd6OllnGZDWU0naQITPnm_2VxlsHJiFlirDE');
const emailSG = "mcolacino@squarefoot.com";
const ssLogID ='1q9yhWHWMSZ1BW4AtguTYdHEsTRVSmdxRXQUtiwFQpxY';

/*****************low level utility code ************************************ */

Logger = BetterLog.useSpreadsheet(ssLogID);

const curr_formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

const percent_formatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})


// const date_formatter = Utilities.formatDate(dS, "GMT+1", "MMMM d, yyyy")
// function testDateFormatter (){var dS = "1/1/2021"; console.log(date_formatter.format(dS))}

function sortDate(r1, r2) {
  if (r1.BeginDate < r2.BeginDate)
    return -1;
  if (r1.BeginDate > r2.BeginDate)
    return 1;
  return 0;
}

/******************************Multi Use Functions ***************************************** */



/**
 * Purpose: Get a clause from a list of clauses that match the aSelector
 * 
 * @param  {String} aSelector - selector for record/clause
 * @param {object[]} records - records array from DB
 * @return {object[]} record - record found or result: "Not Found"
 */
function getClausefromRecords(aSelector, records) {
  var logLoc = false;  // change to log name
  var fS = "getClausefromRecords";
  var errS = aSelector;
  for (var j = 0; j < records.length; j++) {
    var record = records[j];
    if (record.ClauseSelector == aSelector) { //use aSelector to pick out the correct clause from all the records
      return record
    }
  }
  return "Not Found"
}

function getClausefromRecords2(aSelector, records) {
  var logLoc = false;  // change to log name
  var fS = "getClausefromRecords2";
  var errS = aSelector;
  for (var j = 0; j < records.length; j++) {
    var record = records[j];
    if (record.ClauseKey == aSelector) { //use aSelector to pick out the correct clause from all the records
      return record
    }
  }
  return "Not Found"
}

/**
 * Purpose: Get clause from Records with Subselector
 *
 * @param  {string} aSelector - primary selector from DB
 * @param {string} subSelector
 * @param  {object[]} records - an subset (array) of records from DB
 * @return {object} record - record found or object result: "Not Found" 
 */

function getClausefromRecordwSubSelector(aSelector, subSelector, records) {
  for (var j = 0; j < records.length; j++) {
    var record = records[j];
    if (record.ClauseSelector == aSelector && record.ClauseSubSelector == subSelector) {
      return record
    }
  }
  return { result: "Not Found" } //return a structure so at least type is correct
}

/**
 * Purpose: Gets an answer from a list of responses by using the question as an index
 *
 * @param  {String} question - question from form 
 * @param  {itemReponse[]} itemResponses - an array of responses from a form
 * @return {String} answer - an answer corresponding to question or "Not Found"
 */
function getAnswerWithMap(question, itemResponses) {
  var responses = itemResponses.map(function (response) {
    return response.getItem().getTitle();
  });
  var pos = responses.indexOf(question);
  if (pos == -1) { return "Not Found" }
  var answer = itemResponses[pos].getResponse();
  return answer
}

/**
 * Purpose: Handles all operating expense-related section of the document
 * Refactored 210529
 * @param  {object} form - a form
 * @param {object} docInstance - an instance of a document class
 * @param {object} respInstance - instance of response class
 * @return {string} updateS - return updateS or -1 
 */

var logHandleOE = false;
const oeObj = {
  oeBaseYear: "What year will be used for an Operating Expense Base Year?",
  oeExpStop: "What is the Operating Expense Stop?",
  oePerInc: "What is the Percentage Escalation each year?"
}
function handleOE(form, docInstance, respInstance, tableS) {
  var logLoc = logHandleOE;  // change to log name
  var fS = "handleOE2";
  var errS = "OE question not found in responses";
  var retClauseS = errS, clauseBody, replStruct; // initialize retClauseS to errS

  try {
    var records = getRecordsfromDBbySection("OperatingExpenses", tableS);  // get all at records for oe section
    var oeObjKey = respInstance.matchResponse(oeObj);
    var clause = getClausefromRecords2(oeObjKey, records);  // Clause in the database?; throw error if not
    if (clause == "Not Found") { throw new Error(`clause for ${oeObjKey} not found`) }
    var answerS = getAnswerWithMap(oeObj[oeObjKey], respInstance.getResps());
    if (oeObjKey == "oeExpStop") {
      answerS = curr_formatter.format(answerS);  // opExpStop requires $ formatting
    }
    clauseBody = clause.ClauseBody;
    replStruct = extractReplStruct(clauseBody);
    retClauseS = clauseBody.replace(replStruct, answerS);  // update clause with answer
  }
  catch (err) {
    console.log(`${fS} first part has ${err}`)
    return "Not Found"
  }
  var updateS = updateTemplateBody("<<OperatingExpenses>>", retClauseS, docInstance);  // update doc body
  return updateS // success; just send back whatever came from updateTemplateBody
}

/**
 * Purpose: Extract replacement structure from the body of a clause
 *
 * @param  {string} textbody - chunk of text
 * @return {string} replStruct[0] - return replacement structure
 */

function extractReplStruct(textbody) {
  var regExp = "<<.*>>";
  var replStruct = textbody.match(regExp);
  return replStruct[0]
}

/**
 * Purpose: Handles all real estate taxes
 * Refactored 210505 / 210530
 * @param  {object} f - an instance of form 
 * @return {string} updateS - return updateS or -1
 */
var logHandleRET = false;
const retObj = {
  retBaseYear: "What year will be used for a Real Estate Tax Base Year?",
  retBaseStop: "What $/PSF will be used for a Real Estate Tax Base Amount?"
}
function handleRET(form, docInstance, respInstance, tableS) {
  var logLoc = logHandleRET;  // change to log name
  var fS = "handleRET";
  var errS = "RET question not found in responses";
  var clause, answerS, retClauseS = "Not Found", clauseBody, replStruct;
  try {
    var records = getRecordsfromDBbySection("RealEstateTaxes", tableS);  // all records for OperatingExpenses
    var retObjKey = respInstance.matchResponse(retObj);
    var clause = getClausefromRecords2(retObjKey, records);  // Clause in the database?; throw error if not
    if (clause == "Not Found") { throw new Error(`clause for ${retObjKey} not found`) }
    var answerS = getAnswerWithMap(retObj[retObjKey], respInstance.getResps());
    // found a clause and a question match therefore an answerS
    if (retObjKey == "retBaseStop") { answerS = curr_formatter.format(answerS); }  // stop requires number formatting
    clauseBody = clause.ClauseBody;
    replStruct = extractReplStruct(clauseBody);
    retClauseS = clauseBody.replace(replStruct, answerS);  // update clause with answer  
  }
  catch (err) {
    console.log(`${fS} first part has ${err}`)
    return "Not Found"
  }
  var updateS = updateTemplateBody("<<RealEstateTaxes>>", retClauseS, docInstance);  // update doc body
  return updateS // success;  send back what came from updateTemplateBody
}


/**
 * Purpose: Handles electric
 * Refactored 210505 / 210530
 * @param  {object} f - an instance of form 
 * @param {object} docInstance - instance of document object
 * @return {string} return - return updateS or -1
 */
var logHandleElec = false;
function handleElec(form, docInstance, respInstance, tableS) {
  var clause, answerS, retClauseS, clauseBody, replStruct;
  try {
    var records = getRecordsfromDBbySection("Electric", tableS);  // get all at records for Electric
    var resps = respInstance.getResps();
    answerS = getAnswerWithMap("How will electric be charged?", resps)
    // var clause = getClausefromRecords2(elecObjKey, records);  // Clause in the database?; throw error if not
    switch (answerS) {
      case "Direct Meter":
        clause = getClausefromRecords2("elecDirect", records);  // Is there a clause in the database; should be
        retClauseS = clause.ClauseBody;
      case "Sub Meter":
        clause = getClausefromRecords2("elecSubmeter", records);  // Is there a clause in the database; should be
        retClauseS = clause.ClauseBody;
        break;
      case "Rent Inclusion":
        clause = getClausefromRecords2("elecRentIncCharge", records);
        answerS = getAnswerWithMap("What is the proposed electric charge per square foot?", resps)
        answerS = curr_formatter.format(answerS);
        clauseBody = clause.ClauseBody;
        replStruct = extractReplStruct(clauseBody);
        retClauseS = clauseBody.replace(replStruct, answerS);  // update clause with answer  
        break
      default:
        break;
    }
  }
  catch (err) {
    console.log(`handleElec has ${clause} and ${answerS} and ${err}`);
    return "Not Found"
  }
  try {
    var updateS = updateTemplateBody("<<Electric>>", retClauseS, docInstance);  // update doc body
    return updateS // success; just send back name of the copy to indicate it
  }
  catch (err) {
    console.log(`handleRET: ${err}`);
    return -1
  }
}

/**
 * Purpose: Handle the use provision
 *
 * @param {Object} form - global form
 * @param {Object} docInstance - instance of a document
 * @param {Object} respInstance - instance of a form response
 * @param {String} tableS - database table name (usually "clauses")
 * @return {String} retS - return value
 */

function handleUse(form, docInstance, respInstance, tableS) {
  const useQ = "What will the Premises be used for?";
  var clause, answerS, clauseBody;
  try {
    var records = getRecordsfromDBbySection("Use", tableS);  // get all at records for Use
    var resps = respInstance.getResps();  // get all responses to the form
    answerS = getAnswerWithMap(useQ, resps);  // first check use initial question
    switch (answerS) {
      case "General Office":
        clause = getClausefromRecords2("useGenOffice", records);  // get the clause that goes with
        break;
      case "Office and Light Manufacturing":
        clause = getClausefromRecords2("useOffLightMan", records);  // get the clause that goes with
        break;
      default:
        throw new Error("handleUse: ${answer} doesn't have a clause")
        break;
    }
    clauseBody = clause.ClauseBody;
  } catch (err) {
    console.log(`Beginning of handleOther: ${err}`);
  }
  try {
    var updateS = updateTemplateBody("<<Use>>", clauseBody, docInstance);  // update doc body
    return updateS // success; just send back name of the copy to indicate it
  }
  catch (err) {
    console.log(`handleOther: ${err}`);
    return -1
  }
}

/**********handleTenantName******** */
/**
 * Purpose: Handle tenant name
 * @param {object} form - global form
 * @param {object} docInstance - instance of document class
 * @return {String} updateS - return updateS
 */
function handleTenantName(form, docInstance, respInstance) {
  const tenantQS = "What is the tenant name?";
  var tenantNameS;
  var resps = respInstance.getResps();  // get all responses to the form
  try {
    tenantNameS = getAnswerWithMap(tenantQS, resps); // answer to term question
    updateS = updateTemplateBody("<<ClientCompany>>", tenantNameS, docInstance);
    return updateS
  } catch (err) {
    console.log(`handleTenantName: ${err}`);
    return -1
  }
}

/**
 * Purpose: Handle tenant improvements
 * Refactored 210530
 1. This requires two questions: the first to get the PSF and the second to get the additional conditions
 2. The additional conditions will come in the form of a concatenated string with 0 - n sub strings separated by commas
 3. These substrings need to be pulled out and matched with the appropriate clause
 4. These clauses need to be joined together and then s&r'd against the document
 
 * @param {object} form - local version of the global form
 * @param {object} docInstance - instance of document class
 * @param {object} respInstance - instance of response class
 * @param {string} tableS - table in the database (usually "clauses")
 * @return {String} updateS - return updateS
*/
const tiObj = {
  tiCompBid: "TI Competitive Bid",
  tiFreight: "TI Freight",
  tiAccess: "TI Access"  // additional TI clauses go here
}
function handleTenantImprovements(form, docInstance, respInstance, tableS) {
  try {
    const tiPSFQuestionQS = 'Tenant Improvement Allowance in $/PSF?';
    const tiGatewayQS = "Any additional TI requirements?";
    var resps = respInstance.getResps(); // get responses from form global
    var tiPSFAnswerS = getAnswerWithMap(tiPSFQuestionQS, resps); // answer to TI psf question
    var updateS = updateTemplateBody("<<TenantImprovementPSF>>", tiPSFAnswerS, docInstance);
    // deal with additional requirements
    var tiAdditionalAnswerA = getAnswerWithMap(tiGatewayQS, resps); // answer to TI additional question
    if (tiAdditionalAnswerA.length == 0) {
      var updateS = updateTemplateBody("<<TenantImprovements>>", "", docInstance); // eliminate the string 
    } else {
      var records = getRecordsfromDBbySection("TenantImprovements", tableS);
      var tiS = ""
      tiAdditionalAnswerA.forEach(function (addlS, index) {
        switch (addlS) {  // do a reverse lookup on the object; if new provisions get added add here also
          case tiObj["tiCompBid"]:
            tiS = tiS + getClausefromRecords2("tiCompBid", records).ClauseBody + "\n\n";
            break;
          case tiObj["tiFreight"]:
            tiS = tiS + getClausefromRecords2("tiFreight", records).ClauseBody + "\n\n";
            break;
          case tiObj["tiAccess"]:
            tiS = tiS + getClausefromRecords2("tiAccess", records).ClauseBody + "\n\n";
            break;
          default:  // additional TI clauses go here
            break;
        }
      })
      tiS = tiS.slice(0, tiS.length - 2); // strip off last newline
      var updateS = updateTemplateBody("<<TenantImprovements>>", tiS, docInstance); // eliminate the string from the doc copy 
    }
  } catch (err) {
    console.log(`handleTenantImprovements: ${err}`)
  }
  return updateS
}

/**
 * Purpose: Handle date related questions; first commencement and term 
 *
 * 1. For lease term need to replace lease commencement and lease term, whose
 *    replacements are <<LeaseTerm>> and <<LeaseCommencementDate> and <<EarlyAccess>>
 * 2. First get the questions (there aren't clauses) and the answers
 * 3. Then do the updateTemplateBody for each of these
 
 * @param {object} form - local version of the global form
 * @param {object} docInstance - instance of document class
 * @param {object} respInstance - instance of response class
 * @return {String} updateS - return updateS
 */
const logHandleDates = false;
function handleDates(form, docInstance, respInstance) {
  try {
    const todayS = Utilities.formatDate(new Date(), "GMT+1", "MMMM d, yyyy");
    const dateQS = 'Commencement Date?';
    const termQS = 'Lease Term in Months?';
    const eaccessQS = 'Period of Early Access?';
    var resps = respInstance.getResps() // get responses from instance
    var termAnswer = getAnswerWithMap(termQS, resps); // answer to term question
    var commencementAnswer = Utilities.formatDate(new Date(getAnswerWithMap(dateQS, resps)), "GMT+1", "MMMM d, yyyy");
    var eaccessAnswer = getAnswerWithMap(eaccessQS, resps)
    var updateS = updateTemplateBody("<<LeaseCommencementDate>>", commencementAnswer, docInstance);
    updateS = updateTemplateBody("<<LeaseTerm>>", termAnswer, docInstance);
    updateS = updateTemplateBody("<<EarlyAccess>>", eaccessAnswer, docInstance);
    updateS = updateTemplateBody("<<DateofProposal>>", todayS, docInstance);

    if (logHandleDates == true) { console.log("Date: %s and term: %s", commencementAnswer, termAnswer) }

  } catch (err) {
    console.log(`handleDates: ${err}`);
    return -1
  }
  return updateS
}

/**
 * Purpose:  Handle broker related issues included name, address, company and title 
 * No refactor needed; doesn't use clauses through selectors
 * @param {object} form - local version of the global form
 * @param {object} docInstance - instance of document class
 * @param {number} contactID - unique contactID integer for the broker
 * @return {string} updateS - return updateS
 */
/*
1. Go the DB database and extract the broker information using the broker ID 
2. Construct the landlord broker instance after extracting the values from the json record
3. call updateTemplate body three times
*/

function handleLandlordBroker(form, docInstance, contactID) {
  var fullName;
  try {
    var brokerJSONRecords = getContactByID(contactID);
    var records = brokerJSONRecords.map(function (record) {
      return record.fields;
    });
    var firstname = records[0].FirstName;
    var lastname = records[0].LastName;
    var fullName = firstname + " " + lastname;
    var contactaddress = records[0].ContactAddress;
    var company = records[0].Company;
    var title = records[0].Title;
    var contactemail = records[0].ContactEmail;
    var bInst = new brokerC(contactID, firstname, lastname, title, company, contactemail, contactaddress);
    bInst.perType = "LANDLORD_AGENT";
    bInst.setReptList([]);
    var replacementA = bInst.getReptList();
    var updateS = updateTemplateBody(replacementA[0], fullName, docInstance);
    updateS = updateTemplateBody(replacementA[1], company, docInstance);
    updateS = updateTemplateBody(replacementA[2], contactaddress, docInstance);

  }
  catch (err) {
    console.log(`handleLandlordBroker: ${err}`);
    return -1
  }
  return updateS
}

/**
 * Purpose:  Handle premises related issues included address, premises description, landlord name
 *
 * @param {object} form - global form
 * @param {object} docInstance - instance of document class
 * @param {number} spaceID - integerrepresenting the space in question
 * @return {string} updateS - return updateS
 */

var logHandlePremises = false;
function handlePremises(form, docInstance, spaceID) {  // space id is the index into the tourBook table
  var logLoc = logHandlePremises;  // change to log name
  var updateS;
  var fS = "handlePremises";
  var errS = spaceID.toString();
  try {
    var jsonRecs = getBySpaceID(spaceID, 'tourbook');  // throws error if can't get record
    var records = jsonRecs.map(function (record) {
      return record.fields;
    });
    var spaceIdentity = records[0].SpaceIdentity; // get the key from the tourbook
    var jsonRecs = getBySpaceID(spaceIdentity, "spacesbuildingcontacts");  //  key to get all the space info
    var records = jsonRecs.map(function (record) {
      return record.fields;
    });
    var buildingaddress = (records[0].BuildingAddress)[0];  // 
    if (buildingaddress == undefined) { buildingaddress = "No building address in database" }
    var premises = formatPremises(records[0].suite, records[0].floor);
    // formatPremises deals with when both are undefined
    var landlord = (records[0].CompanyName)[0];
    if (landlord == undefined) { landlord = "No landlord in database" }

    //var status = records[0].Status;
    var updateS = updateTemplateBody("<<Location>>", buildingaddress, docInstance);
    if (logLoc) { console.log(`${fS}:  ${updateS}`) }
    updateS = updateS + "\n" + updateTemplateBody("<<Premises>>", premises, docInstance);
    if (logLoc) { console.log(`${fS}:  ${updateS}`) }
    updateS = updateS + "\n" + updateTemplateBody("<<LandlordName>>", landlord, docInstance);
    if (logLoc) { console.log(`${fS}:  ${updateS}`) }
  }
  catch (err) { console.log(`${fS}: problem with ${errS}: error: ${err}`) }
  return updateS
}



/**
 * Purpose: Take a possible floor string and suite string and return a well-formatted premises or error string
 *
 * @param  {String} suiteS- suite from database
 * @param  {String} floorS - floor from database 
 * @return {String} retS - premises or error string
 */
function formatPremises(suiteS, floorS) {
  var fS, sS;
 
  floorS == undefined ? fS = "" : fS = `Floor: ${floorS}`;
  // if (floorS==undefined) { var fS = ""} else   {var fS = `Floor: ${floorS}` };
  suiteS == undefined ? ss = "" : ssS = `Suite: ${suiteS}`;
  // if (suiteS == undefined) { var sS = "" } else { var sS = `Suite: ${suiteS}` }
  var retS = fS + " " + sS;
  return retS
}

/*********** handleBaseRent********/
/**
 * Purpose: Handle base rent
 *
 * @param  {Object} docInstance - document instance
 * @param  {Number} spaceID - integer index into the tourbook table
 * @return {String} updateS - return value
 */

var logHandleBaseRent = false;
function handleBaseRent(docInstance, spaceID) {
  var offsetObj = {}, tempS = "", offset = 0;
  // get the local doc body from the doc instance
  var doc = docInstance.locBody;
  // Find the replacement text
  var rgel = doc.findText("<<BaseRentalRate>>");
  var el = rgel.getElement().getParent(); // take the found element and get its parent
  var elType = el.getType();
  var loopCtl = el.toString()  // use the type of the parent (as string) to start the loop
  while (loopCtl != "BODY_SECTION") { // stop when you get to the body section
    par = el.getParent();
    parType = par.getType(); // put parent type into var
    el = par; // make the parent into the current element, el 
    offset = el.getParent().getChildIndex(el); // go up and down to count siblings
    loopCtl = parType.toString();
    offsetObj[loopCtl] = offset;
  }
  /* At this point we know that the basic structure is table/table row/table cell/paragraph. Go down the structure by using getChild, stopping at cell. Use the offset list to determine which child should be looked at. Look at the child of the cell (a paragraph FYI) and null out the second paragraph which should be "<<BaseRentalRate>>". Note this will break if there is a new line or anythig added as a second paragraph in the templace cell */
  var t0 = doc.getChild(offsetObj["TABLE"]);
  var r0 = t0.getChild(offsetObj["TABLE_ROW"]);
  var c0 = r0.getChild(offsetObj["TABLE_CELL"]);
  //c0.getChild(1).asText().setText('');  // delete <<BaseRentalRate>>
  doc.replaceText("<<BaseRentalRate>>", '\n');

  // go to the DB and get the proposed rental rates associated with this spaceID
  var retBR = getBySpaceID(spaceID, "proposedrent");
  // getSpacetOrRentByID returns a json; needs its fields extracted for  access
  var records = retBR.map(function (record) {
    return record.fields;
  });
  // call the sort function (below) to order by begin date (note should be done in DB)
  records.sort(sortDate);
  // create the base rent table; header first
  var t = [["Begin Date", "End Date", "Rent PSF"]];
  // for all the base records, push the created row onto the table
  for (var j = 0; j < records.length; j++) {
    row = [
      Utilities.formatDate(new Date(records[j].BeginDate), "GMT+1", "MMMM d, yyyy"),
      Utilities.formatDate(new Date(records[j].EndDate), "GMT+1", "MMMM d, yyyy"),
      curr_formatter.format(records[j].RentPSF)
    ]
    t.push(row);
  }
  if (logHandleBaseRent) { console.log(t) };
  c0.insertTable(2, t); // insert the table at c0 created above, third paragraph
  var s = c0.getChild(1).getType().toString();
  var s = c0.getChild(2).getType().toString();
  var s = c0.getChild(3).getType().toString();
  // c0.getChild(2).setColumnWidth(0, 80);
  // c0.getChild(2).setColumnWidth(1, 80);
  // c0.getChild(2).setColumnWidth(2, 70);

  // docInstance.saveAndCloseTemplate();
  return `Base Rent Updated for ${spaceID}`
}

/**
 * Purpose: Handle parking
 *
 * @param  {object} form - global form
 * @param  {object} docInstance - object containing the document to be worked on
 * @param {object} respInstance - instance of response class
 * @param {string} tableS - string table name
 * @return {string} updateS - return updateS
 */
const logHandleParking = false;
function handleParking(form, docInstance, respInstance, tableS) {
  var logLoc = logHandleParking;
  var fS = "handleParking";
  var errS = "not known";
  const parkingQ = "What is the monthly charge for Parking?";
  try {
    // First get the clause from the DB by using the section embedded
    var resps = respInstance.getResps();  // get all responses to the form; loop array of questions
    var records = getRecordsfromDBbySection("Parking", tableS); // all section records
    var clause = getClausefromRecords2("parkCharge", records);  // Is there a clause in the database; should be
    var clauseBody = clause.ClauseBody;
    var replStruct = extractReplStruct(clauseBody);
    var answerS = getAnswerWithMap(parkingQ, resps); // Does this question match with a response; false if not
    errS = answerS;
    var parkAnswerS = clauseBody.replace(replStruct, answerS);
    var updateS = updateTemplateBody("<<Parking>>", parkAnswerS, docInstance);
  } catch (err) { console.log(`${fS}: problem with ${errS}: error: ${err}`) }
  return updateS
}

const parkingObj = {
  UnreservedNumber: 82370099,
  'UnreservedInitialCost': 1747722459,
  ReservedNumber: 1548343364,
  ReservedInitialCost: 1731556646,
  ParkingCostPercentIncrease: 1420823252
}
/**
* Purpose: Handle parking outside NYC
*
* @param  {object} parking form- parking form
* @param  {object} docInstance - instance of document class
* @param {string} tableS - name of table string
* @return {String} retS - return value
*/
function handleParkingOutsideNYC(parkingform, docInstance, tableS) {
  var fS = "handleParkingOutsideNYC";
  var errS = "not known";
  try {
    // First get the clause from the DB by using the section embedded
    var records = getRecordsfromDBbySection("Parking", tableS); // all section records
    var clause = getClausefromRecords2("parkCharge", records);  // Is there a clause in the database; should be
    var clauseBody = clause.ClauseBody;
    Object.keys(parkingObj).forEach(k => {
      var resp = responseByItemID(parkform, parkingObj[k]);
      if (k == "UnreservedInitialCost" || k == "ReservedInitialCost") {
        resp = curr_formatter.format(resp);
      }
      else if (k == "ParkingCostPercentIncrease") {
        resp = percent_formatter.format(resp);
      }
      var repl = "<<" + k + ">>";
      clauseBody = clauseBody.replace(repl, resp);
    })
    var updateS = updateTemplateBody("<<Parking>>", clauseBody, docInstance);
  } catch (err) { console.log(`${fS}: problem with ${errS}: error: ${err}`) }
  return updateS
}

/**
 * Purpose: Handle the broker submitting the proposal *current
 *
 * @param  {Object} form - global form
 * @param  {Object} docInstance- document instance
 * @param {String} emS - email string
 * @return {String} updateS - return updateS
 */
/* 
Get broker full name and license number; including error check if there is no license number 
<<BrokerName>>
<<BrokerageLicense>>
<<BrokerEmail>>
*/
var logHandleSFBroker = false;
function handleSFBroker(form, docInstance, emS) {
  var logLoc = logHandleSFBroker;
  var fS = "handleSFBroker";
  var errS = emS;
  try {
    [brokerNameS, brokerLicenseS] = getBrokerInfo(emS);
    var updateS = updateTemplateBody("<<BrokerName>>", brokerNameS, docInstance);
    if (logLoc) { console.log(`${fS}:  ${updateS}`) }
    updateS = updateS + "\n" + updateTemplateBody("<<BrokerageLicense>>", brokerLicenseS, docInstance);
    if (logLoc) { console.log(`${fS}:  ${updateS}`) }
    updateS = updateS + "\n" + updateTemplateBody("<<BrokerEmail>>", emS, docInstance);
    if (logLoc) { console.log(`${fS}:  ${updateS}`) }
  }
  catch (err) { console.log(`${fS}: problem is ${errS}: error: ${err}`) }
  return updateS
}

/**
 * Purpose: Handle security deposit
 *
 * @param  {Object} form - global form
 * @param  {Objec} docInstance - instance of document
 * @param {object} respInstance - instance of response class
 * @param {string} tableS - name of table string
 * @return {String} updateS - return string or -1
 */
var logHandleSecurity = false;
function handleSecurity(form, docInstance, respInstance, tableS) {
  var logLoc = logHandleSecurity;
  var fS = "handleSecurity";
  var secQ = "How many months of rent will be provided as security?"
  try {
    var records = getRecordsfromDBbySection("Security", tableS);  // get all at records for Use
    var resps = respInstance.getResps();  // get all responses to the form
    var answerS = getAnswerWithMap(secQ, resps);  // first check initial question
    var clause = getClausefromRecords2("secDeposit", records);  // get the clause that goes with
    var clauseBody = clause.ClauseBody;
    var replStruct = extractReplStruct(clauseBody);
    var retClauseS = clauseBody.replace(replStruct, answerS);  // update clause with answer  
  } catch (err) {
    console.log(`${fS}: error: ${err}`);
  }
  try {
    var updateS = updateTemplateBody("<<SecurityDeposit>>", retClauseS, docInstance);  // update doc body
    return updateS // success; just send back name of the copy to indicate it
  }
  catch (err) {
    console.log(`${fS}: error: ${err}`);
    return -1
  }
}

/****************************************MAIN************************************ */
function initAll() {
  var docInst = new docC();
  return docInst
}
var logMain = true;
function main() {
  var sID = 1;  // for testing purposes
  var tableS = "clauses"
  var docInstance = initAll();
  var respInstance = new responseC(form);
  var retS;

  retS = handleOE(form, docInstance, respInstance, tableS);
  if (logMain) { console.log(retS) }
  retS = handleRET(form, docInstance, respInstance, tableS);
  if (logMain) { console.log(retS) }
  retS = handleElec(form, docInstance, respInstance, tableS);
  if (logMain) { console.log(retS) }
  retS = handleUse(form, docInstance, respInstance, tableS);
  if (logMain) { console.log(retS) }
  retS = handleTenantName(form, docInstance, respInstance);
  if (logMain) { console.log(retS) }
  retS = handleTenantImprovements(form, docInstance, respInstance, tableS);
  if (logMain) { console.log(retS) }
  retS = handleDates(form, docInstance, respInstance);
  if (logMain) { console.log(retS) }
  retS = handleLandlordBroker(form, docInstance, sID);
  if (logMain) { console.log(retS) }
  var retS = handlePremises(form, docInstance, sID);  // 1 just for testing
  if (logMain) { console.log(retS) }
  retS = handleBaseRent(docInstance, sID);
  if (logMain) { console.log(retS) }
  retS = handleParking(form, docInstance, respInstance, tableS);
  if (logMain) { console.log(retS) }
  retS = handleSFBroker(form, docInstance, emailSG);
  if (logMain) { console.log(retS) }
  retS = handleSecurity(form, docInstance, respInstance, tableS)
  if (logMain) { console.log(retS) }


  docInstance.saveAndCloseTemplate();
}


function testPark() {
  var tableS = "clauses";
  var docInst = initAll();
  retS = handleParkingOutsideNYC(parkform, docInst, tableS);
}
