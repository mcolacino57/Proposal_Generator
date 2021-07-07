const TENANT_NAME = "test Tenant";

/* Functions:

testUnit: general unit test, does testDB, testGetClause, testExamineForm and testGetItemResponses
testApiCall: tests the interface with DB by asking for clauses by section for Electric
testFormResponses (working 210506): goes through the global form and prints out all the questions (just responses)  and answers
testGetItemReponses: gets the first question and answer from the form, just to establish that it exists and has responses
testGetClause: gets clause for "OperatingExpenses" 2 ways: direct from DB and then by getRecordsfromDBbySection()
testDB: stub for getClausefromDB
testHandleDates: stub for handleDates, with document initialization
testHandleLandlordBroker: stub for handleLandlordBoker
testExamineForm: stub for examineForm()
testGetContactByID: stub for getContactByID(1)
testSearchBody: goes through the document and creates/prints the offset object
testDocument: test adding table for base rent
testCSVJson: test converting csv file to json
testDropTable: drop a table from mySQL database
testCreateClauseTable: create the clause table in the mySQL database
testReadFromTable: read all rows from a specfic section (electric)
testTransDatesFromCSVClauses: translate dates to the correct form from CSV version of clauses (from AT)
testDBConnection: test to see if the connectin is working, duh

DEPRECATED
testFormClauseClass: just like it says; not used
testDocClass: just like it says; not used
 */

/****************************Utility Functions************************************** */
// Helper function to locate field based on search text
// Should deprecate since not called
function findThisText_(body, text) {
  var found = body.findText(text);
  if (found) {
    return found.getElement().getParent();
  } else {
    return null;
  }
}

var logLongTestUnit = true;
function testUnit() {
  var answer = testDB();  // testDB
  var answerS = JSON.stringify(answer);
  if (answerS == clauseS) { console.log("testDB passes"); }
  console.log(testGetClause());
  if (logLongTestUnit) {
    testExamineForm();  // TestExamineForm
  }
  else { console.log("Skipping examineForm") }
  var ret3 = populateForm();
  if (logLongTestUnit) {
    retA = testGetItemReponses();
    console.log(`Question: ${retA[0]}, Answer: ${retA[1]}`);
  }
  else { console.log("Skipping getIemResponses form") }
}

function testApiCall() {
  var retval = getClausesBySection("Electric");
  console.log(retval);
}

/* 
This function logs all the formReponses and all the itemResponses
Documented here: https://developers.google.com/apps-script/reference/forms/form-response
*/
function getFormResponses(form) {
  // Use the global form ID and log the responses to each question.
  var formResponses = form.getResponses();
  console.log("Number of responses is %s ", formResponses.length)
  for (var i = 0; i < formResponses.length; i++) {
    var formResponse = formResponses[i];
    var itemResponses = formResponse.getItemResponses();
    for (var j = 0; j < itemResponses.length; j++) {
      var itemResponse = itemResponses[j];
      console.log('Response to question #%s: "%s" was "%s"',
        (j + 1).toString(),
        itemResponse.getItem().getTitle(),
        itemResponse.getResponse());

    }
  }
}

function testGetFormResponses(){
 getFormResponses(FormApp.openById(oeFormID));
}

// Note that this fails if there are no responses
function testGetItemReponses() {
  try {
    var formResponses = form.getResponses();
    if (formResponses.length == 0) { throw new Error("No responses to the form") }
    var formResponse = formResponses[0];
    var retA = formResponse.getItemResponses();
    var question = retA[0].getItem().getTitle();
    var answer = retA[0].getResponse();
  }
  catch (err) {
    console.log(err);
    throw new Error("Failed inside testGetItemResponses");
  }
  return [question, answer]
}

// Functional as of 210418
function testGetClause() {
  var selector = "What is the Operating Expense Stop?";
  try {
    var clause1 = getClausefromDB(selector, "OperatingExpenses"); // This is a selector
    var clause2 = getClausefromRecords(selector, getRecordsfromDBbySection("OperatingExpenses"));
    if (JSON.stringify(clause1) == JSON.stringify(clause2)) {
      return ("testGetClause passes");
    } else {
      throw new Error("testGetClause: returns from getClausefromDB and getClausefromRecords differ");
    }
  }
  catch (err) {
    console.log(err.message);
  }
  // console.log(clause2.ClauseSelector);
}

/***************** unit test globals ***************************************** */

var clauseS = '{"ClauseID":3,"ClauseBody":"Tenant shall pay its proportionate share of any increases in operating expenses over a  <<OpExpStop>> expense stop. No escalations shall be due and payable until the one year anniversary of Rent Commencement","ClauseSelector":"What is the Operating Expense Stop?","ClauseReplStructure":"<<OpExpStop>>","Section":"OperatingExpenses"}';


/*****************unit tests****************************************************** */


function testFormClauseClass() {
  cFsInst = new formClauseC("Electric", "New York City", form, electricQuestionA);
  console.log(cFsInst.getQarrLen());
  console.log(cFsInst.getQarr());
  console.log(cFsInst.questionArr)
  console.log(cFsInst.getName()) // This goes to the parent
  console.log(cFsInst.name)   // both of these seem to work
}

function testDocClass() {
  var n = docInst.docName;
  var cn = docInst.copyName;
  var btext = docInst.getBodyText();
  var blen = docInst.getBodyText().length;
}

function testDB() {
  return getClausefromDB("What is the Operating Expense Stop?", "OperatingExpenses"); // This is a selector
}
function testHandleDates() {
  var docInst = initAll();
  handleDates(form, docInst);
  docInst.saveAndCloseTemplate();
}


function testHandleImprovements() {
  var docInst = initAll();
  handleTenantImprovements(form, docInst);
  docInst.saveAndCloseTemplate();
}

function testHandleLandlordBroker() {
  var docInst = initAll();
  retval = handleLandlordBroker(form, docInst, 1);
  docInst.saveAndCloseTemplate();
}

var logTestHandleParking = true;
function testHandleParking() {
  var dI = initAll();
  var respInstance = new responseC(form);

  var ret = handleParking(form, dI, respInstance, "clauses2")
  dI.saveAndCloseTemplate();

}


var logTestSearchBody = true;
function testSearchBody() {

  var dI = initAll();
  var doc = dI.locBody;
  var rgel = doc.findText("<<BaseRentalRate>>");

  var offsetObj = {}, tempS = "", offset = 0;
  var el = rgel.getElement().getParent();
  var elType = el.getType();
  var loopCtl = el.toString()
  while (loopCtl != "BODY_SECTION") {
    par = el.getParent();
    parType = par.getType(); // put parent type into var
    el = par; // make the parent into the current element, el 
    offset = el.getParent().getChildIndex(el); // go up and down to count siblings
    loopCtl = parType.toString();
    offsetObj[loopCtl] = offset;
  }
  if (logTestSearchBody) { console.log(`Offset object: ${JSON.stringify(offsetObj)}`) }

  try {
    var t0 = doc.getChild(offsetObj["TABLE"]);
    var r0 = t0.getChild(offsetObj["TABLE_ROW"]);
    var c0 = r0.getChild(offsetObj["TABLE_CELL"]);
    c0.getChild(1).asText().setText('');  // delete <<BaseRentalRate>>
  } catch (err) {
    console.log(`Inside gestSearchBody: error ${err}`)
  }

  //c0.insertTable(1,t);
  handleOE
  if (logTestSearchBody) { console.log("testSearchBody passed") }
  //dI.saveAndCloseTemplate();

}


function testGetBaseRentIntoTable() {
  var dI = initAll();
  var spaceID = 1;
  var retBR = handleBaseRent(dI, 1);
}


function testHandleOEandRETandElec() {
  var dI = initAll();
  ret = handleOE(form, dI);
  ret = handleRET(form, dI);
  ret = handleElec(form, dI)
  dI.saveAndCloseTemplate();
}

function testHandleSFBroker() {
  var dI = initAll();
  handleSFBroker(form, dI, emailSG);
}

function testhandleOE2() {
  var dI = initAll();
  handleOE2(form, dI)
}

function testhandlePremises() {
  var dI = initAll();
  var retS = handlePremises(form, dI, "3");
}

function testExamineForm() { var retval = examineForm(form) }
function testGetContactByID() { console.log(getContactByID(1)) }
function testOutputForm() { var retval = outputForm(form) }
function testFindContact() {
  var emailS = "mcolacino@squarefoot.com";
  var retA = getBrokerInfo(emailS);
  console.log(`name: ${retA[0]}, license: ${retA[1]}`)
}
function testExtractReplStruct() {
  var clause = "Electricity will be <<ERICost>> per square foot. Landlord shall provide 6 watts per RSF demand load for lights and plugs, exclusive of HVAC, to panels on floor with distribution capacity sufficient to accommodate Tenant’s needs.";
  var testS = extractReplStruct(clause);
}

/************* Database Test Functions ******************** */
function testDropTable() {
  var dbInst = new databaseC("applesmysql");
  var retS = dropTable_("clauses");
}
function testCreateClauseTable() {
  var dbInst = new databaseC("applesmysql");
  var retS = createClauseTable_(dbInst);
}

function testCSVJson() {
  var resJ = csvToJson(testString);
  var resK = Object.keys(resJ[0]);
  console.log(resK);
}

function testTransDatesFromCSVClauses() {
  [header, rows] = transDatesFromCSVClauses();
  var fileNameS = "clauses_tmp";
  //console.log(rows);
  ret = saveAsCSV(fileNameS, rows);
}

function testDBConnection() {
  try {
    var dbInst = new databaseC("applesmysql");
    var dburl = dbInst.getdbUrl();
  } catch (e) {
    console.log(`in testDBConnection err: ${e} and dburl is: ${ dburl }`);
    return -1
  }
  console.log(`successful connection for ${dburl}`)
  dbInst.getconn().close;

}

