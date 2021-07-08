// To get:
// TenantName, LandlordBroker, Use, LeaseCommencement, Lease Term, Early Access, Security
// PREMISES: RSF, Floor, Suite
const todayS = Utilities.formatDate(new Date(), "GMT-4", "yyyy-MM-dd");
const nowS = Utilities.formatDate(new Date(), "GMT-4", "yyyy-MM-dd HH:MM:ss");
const userEmail = Session.getActiveUser().getEmail();
const ssLogID = '10k-ZlgLUsli6xKdl_vU5ldqSBK-693PR0WrDNGvIDe0';  //See Roam ((MfNjAFH1f))
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
    var f = FormApp.getActiveForm();
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
    return "Problem"
  }
  return "Success"
}

/**
 * Purpose: Evaluate proposal creation inputs
 *
 * @param  {string} propS - proposal name string
 * @param  {object} dbInst - instance of databaseC
 * @param {object[]} respA - response array
 * @return {string} retS - Success or Problem
 */
const logEvalPS = true;
function evalPS(propS, dbInst, respA) {
  var fS = 'evalPS'; // start here
  const qA = [
    "What is the tenant name?",
    "Space?"];

  var psO, tS, spaceS;
  try {
    // First question: tenant name
    var psO = respA.find((responseObj) => responseObj.question === "What is the tenant name?");
    psO == undefined ? tS = `Tenant missing in form` : tS = psO.answer;
    // Second question: space identifying string, which needs to be parsed 
    // and the the space_identiy pulled from the sub_spaces view
    var psO = respA.find((responseObj) => responseObj.question === "Space?");
    psO == undefined ? spaceS = `Space missing in form` : spaceS = psO.answer;


    var psRec = {
      'ProposalName': propS,
      'ProposalClauseKey': psClauseKey,
      'ProposalQuestion': psQuestS,
      'ProposalAnswer': psAnsS,
      'CreatedBy': userEmail,
      'CreatedWhen': todayS,
      'ModifiedWhen': nowS,
      'ModifiedBy': userEmail
    }
    var retS = writePropDetail(dbInst, psRec);

  } catch (e) {
    logEvalPS ? Logger.log(`In ${fS}: ${e}`) : false;
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