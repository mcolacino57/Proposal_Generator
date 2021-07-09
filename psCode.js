// To get:
// Proposal Name, TenantName, and Space
// Constructs display_space from: address, Floor, Suite, RSF
const todayS = Utilities.formatDate(new Date(), "GMT-4", "yyyy-MM-dd");
const nowS = Utilities.formatDate(new Date(), "GMT-4", "yyyy-MM-dd HH:MM:ss");
const userEmail = Session.getActiveUser().getEmail();
const ssLogID = '10k-ZlgLUsli6xKdl_vU5ldqSBK-693PR0WrDNGvIDe0';  //Logging spreadsheet 
Logger = BetterLog.useSpreadsheet(ssLogID);

function onSubmit() {
  var retS = evalPSResponses();
}

/**
 * Purpose: Evaluate responses to this form and write records to proposal
 *
 * @return {String} retS - Success
 */
const logEvalPSResponses = true;
function evalPSResponses() {
  const fS = "evalPSResponses";
  const pQS = "Proposal Name?"; // proposal question
  var propS;
  try {
    var dbInst = new databaseC("applesmysql");
    // get responses into an array of objects of the form [{"question": qS, "answer": aS},...]
    var f = FormApp.openById(psFormID);
    var respA = crFormResponseArray(f);
    // get proposal name
    var propO = respA.find((responseObj) => responseObj.question === pQS);
    if (!propO) {
      propS = "No proposal name in form";
      throw new Error('missing proposal name');
    }
    else { propS = propO.answer; }
    retS = evalPS(propS, dbInst, respA);
  } catch (e) {
    logEvalPSResponses ? Logger.log(`In ${fS}: ${e}`) : false;
    retS = "Problem";
  }
  return retS
}

/**
 * Purpose: Evaluate proposal creation inputs
 *
 * @param  {String} propS - proposal name string
 * @param  {Object} dbInst - instance of databaseC
 * @param {Object[]} respA - response array
 * @return {String} retS - Success or Problem
 */
const logEvalPS = true;
function evalPS(propS, dbInst, respA) {
  var fS = 'evalPS'; 
  var psO, tS, spaceS;
  try {
    // First question: tenant name
    var psO = respA.find((responseObj) => responseObj.question === "What is the tenant name?");
    psO == undefined ? tS = `Tenant missing in form` : tS = psO.answer;
    // Second question: space identifying string, which needs to be parsed 
    // and the the space_identiy pulled from the sub_spaces view
    var psO = respA.find((responseObj) => responseObj.question === "Space?");
    psO == undefined ? spaceS = `Space missing in form` : spaceS = psO.answer;
    var space_identity = getIDfromSpaceDisplay(dbInst,spaceS); // in psCode.gs
    var psRec = {
      'ProposalName': propS,
      'space_identity': space_identity,
      'TenantName': tS,
      'ProposalSize': "S",
      'CreatedBy': userEmail,
      'CreatedWhen': todayS,
      'ModifiedWhen': nowS,
      'ModifiedBy': userEmail
    }
    var retS = writeProposal(dbInst, psRec); // in gcloudSQL

  } catch (e) {
    logEvalPS ? Logger.log(`In ${fS}: ${e}`) : false;
    return "Problem"
  }
  return "Success"
}

/**
 * Purpose: Gets the space identity from display_spaces view, 
 * (input param in form: <Address> / S: <Suite> / F: <Floor> / SF: <SF>)
 *
 * @param  {Object} dbInst - database class instance
 * @param  {String} spaceS - space display string
 * @return {String} spaceID - return value
 */
function getIDfromSpaceDisplay(dbInst,spaceS){
  var fS = "getIDfromSpaceDisplay";
  var retS="display_space not found";  // default if qry doesn't find any matches
  try {
    var qryS = `SELECT space_identity FROM display_spaces WHERE display_space = "${spaceS}";`;
    var locConn = dbInst.getconn(); // get connection from the instance
    var stmt = locConn.createStatement();
    var results = stmt.executeQuery(qryS);  // add error handling if no results?
    while (results.next()) {
      retS = results.getString("space_identity");
    }
  } catch (err) {
    console.log(`In ${fS}: ${e}`);
    retS = "Problem";
  }
  return retS
}

/*Section*/
/***************************TESTS *************************************** */

function testCrFormResponseArray() {
  var f = FormApp.getActiveForm();
  var resp = crFormResponseArray(f);
  console.log(resp)
}

function testEvalResponses() {
  var ret = evalPSResponses();

}