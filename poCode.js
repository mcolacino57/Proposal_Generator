// To get:
// TenantName, LandlordBroker, Use, LeaseCommencement, Lease Term, Early Access, Security
// PREMISES: RSF, Floor, Suite
const todayS = Utilities.formatDate(new Date(), "GMT-4", "yyyy-MM-dd");
const nowS = Utilities.formatDate(new Date(), "GMT-4", "yyyy-MM-dd HH:MM:ss");
const userEmail = Session.getActiveUser().getEmail();
const ssLogID = '1DfcXzFsXksQVe_FkXbOnB4d56F5xFLhyBtGMTw2XTws';
Logger = BetterLog.useSpreadsheet(ssLogID);

function onSubmit() {
  var retS = evalPOResponses();
}

/**
 * Purpose: Evaluate responses to this form and write records to prop_detail table
 * Calls evalOE, evalRET, evalElec functions
 *
 * @return {String} retS - Success
 */
const logEvalPOResponses = true;
function evalPOResponses() {
  const fS = "evalResponses";
  const pQS = "Proposal to be used:"; // proposal question
  var propS;
  try {
    var dbInst = new databaseC("applesmysql");
    // get responses into an array of objects of the form [{"question": qS, "answer": aS},...]
    var f = FormApp.getActiveForm();
    var respA = crFormResponseArray(f);
    // get proposal name
    var propO = respA.find((responseObj) => responseObj.question === pQS);
    if (!propO) {
      propS = "No proposal in form";
      throw new Error('missing proposal');
    }
    else { propS = propO.answer; }
    //eval operating expenses
    //var retS = evalOE(propS, dbInst, respA);
    //retS = evalRET(propS, dbInst, respA);
    retS = evalPO(propS, dbInst, respA);
    // retS = evalPremises(propS,dbInst,respA);
  } catch (e) {
    logEvalPOResponses ? Logger.log(`In ${fS}: ${e}`) : false;
    return "Problem"
  }
  return "Success"
}

/**
 * Purpose: Evaluate proposal overview inputs
 *
 * @param  {string} propS - proposal name string
 * @param  {object} dbInst - instance of databaseC
 * @param {object[]} respA - response array
 * @return {string} retS - Success or Problem
 */
const logEvalPO = true;
function evalPO(propS, dbInst, respA) {
  var fS = 'evalPO'; // start here
  const qA = [
    "What is the tenant name?",
    "Landlord Broker Name?",
    "What will the Premises be used for?",
    "Lease Commencement Date?",
    "Lease Term in Months?",
    "Period of Early Access?",
    "How many months of rent will be provided as security?"];

  var poO, poAnsS, poQuestS, poS;
  try {
    // loop over the question array
    for (var i in qA) {
      poQuestS = qA[i];
      // for each question try to get an answer or assign default string 
      var poO = respA.find((responseObj) => responseObj.question === poQuestS);
      poO == undefined ? poS = `${poQuestS} missing in form` : poS = poO.answer;
      var poAnsS = poS || "Proposal answer not found in response array";
      var poClauseKey = questionToClauseKey(dbInst, poQuestS);
      if (poClauseKey == undefined) { throw new Error(`no ClauseKey`) }
      var poRec = {
        'ProposalName': propS,
        'ProposalClauseKey': poClauseKey,
        'ProposalQuestion': poQuestS,
        'ProposalAnswer': poAnsS,
        'CreatedBy': userEmail,
        'CreatedWhen': todayS,
        'ModifiedWhen': nowS,
        'ModifiedBy': userEmail
      }
      var retS = writePropDetail(dbInst, poRec);
    }
  } catch (e) {
    logEvalPO ? Logger.log(`In ${fS}: ${e}`) : false;
    return "Problem"
  }
  return "Success"
}

/*Section*/
/********************UTILITIES ******************** */
/**
 * Purpose: Take a question and return the corresponding ClauseKey
 *
 * @param  {object} dbInst - param
 * @return {String} ClauseKey - returned clause key
 */
function questionToClauseKey(dbInst, qS) {
  var fS = "questionToClauseKey";
  try {
    var qryS = `SELECT ClauseKey FROM ck_question WHERE Question = "${qS}";`;
    var locConn = dbInst.getconn(); // get connection from the instance
    var stmt = locConn.createStatement();
    var results = stmt.executeQuery(qryS);
    while (results.next()) {
      var retS = results.getString("ClauseKey");
    }
  } catch (err) {
    console.log(`In ${fS}: ${e}`);
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

function testGetProposalData() {
  var pd = getProposalData("mcolacino@squarefoot.com");

}

function testGetNamedProposalData() {
  var ps = 'SoftGuy 222 West 42nd 3rd Floor';
  var pO = getNamedProposalData(ps);
  console.log(pO)
}

function testEvalResponses() {
  var ret = evalPOResponses();

}