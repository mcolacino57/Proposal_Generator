
const todayS = Utilities.formatDate(new Date(), "GMT-4", "yyyy-MM-dd");
const nowS = Utilities.formatDate(new Date(), "GMT-4", "yyyy-MM-dd HH:MM:ss");
const userEmail = Session.getActiveUser().getEmail();
const ssLogID = '11tvdiFdPIiO_Xxoac067K8_vApAqpb-RSyNcLgC66Us';
Logger = BetterLog.useSpreadsheet(ssLogID); 


function onSubmit() {
  var retS = evalTIResponses();
}

/**
 * Purpose: Evaluate responses to this form and write records to prop_detail table
 *
 * @return {String} retS - Success
 */
function evalTIResponses() {
  const fS = "evalTIResponses";
  const pQS = "Proposal to be used:"; // proposal question
  var propS, retS;
  try {
    var dbInst = new databaseC("applesmysql")
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
    retS = evalAllowance(propS, dbInst, respA);
    retS = evalTIProvisions(propS, dbInst, respA);

  } catch (e) {
    Logger.log(`In ${fS}: ${e}`);
    return "Problem"
  }
  return "Success"
}

/**
 * Purpose: Evaluate TI Provisions
 *
 * @param  {string} propS - proposal name string
 * @param  {object} dbInst - instance of databaseC
 * @param {object[]} respA - response array
 * @return {string} retS - Success or Problem
 */
const logEvalTIProvisions = false;
function evalTIProvisions(propS, dbInst, respA) {
  var fS = 'evalTIProvisions';
  const qA = [
    "TI Competitive Bid?",
    "TI Free Freight?",
    "TI Access?"];

  var tipO, tipAnsS, tipQuestS, tipS;
  try {
    for (var i in qA) {
      tipQuestS = qA[i];
      // for each question try to get an answer or assign default string 
      var tipO = respA.find((responseObj) => responseObj.question === tipQuestS);
      // Note: for all checkboxes and multi-choices this needs to deal with the 
      // fact that an array comes back; here it's just answer[0] that gets the
      // correct response
      tipO == undefined ? tipS = `${tipQuestS} missing in form` : tipS = tipO.answer[0];
      var tipAnsS = tipS || "TI answer not found in response array";
      var tipClauseKey = questionToClauseKey(dbInst, tipQuestS);
      if (tipClauseKey == undefined) { throw new Error(`no ClauseKey`) }
      var tipRec = {
        'ProposalName': propS,
        'ProposalClauseKey': tipClauseKey,
        'ProposalQuestion': tipQuestS,
        'ProposalAnswer': tipAnsS,
        'CreatedBy': userEmail,
        'CreatedWhen': todayS,
        'ModifiedWhen': nowS,
        'ModifiedBy': userEmail
      }
      var retS = writePropDetail(dbInst, tipRec);
    }
  } catch (e) {
    Logger.log(`In ${fS}: ${e}`);
    return "Problem"
  }
  return "Success"
}

/**
 * Purpose: Evaluate TI Allowance
 *
 * @param  {string} propS - proposal name string
 * @param  {object} dbInst - instance of databaseC
 * @param {object[]} respA - response array
 * @return {string} retS - Success or Problem
 */
const logEvalAllowance = false;
function evalAllowance(propS, dbInst, respA) {
  var fS = 'evalAllowance';
  const tiQS = "Tenant Improvement Allowance in $/PSF?";
  var tiS, tiQuestionS, tiAnswerS;
  try {
    var tiO = respA.find((responseObj) => responseObj.question === tiQS);
    tiO == undefined ? tiS = "No ti allowance  q in form" : tiS = tiO.answer;
    var tiClauseKey = questionToClauseKey(dbInst, tiQS);
    if (tiClauseKey == undefined) { throw new Error(`Unable to find ClauseKey`) }
      var tiRec = {
        'ProposalName': propS,
        'ProposalClauseKey': tiClauseKey,
        'ProposalQuestion': tiQS,
        'ProposalAnswer': tiS,
        'CreatedBy': userEmail,
        'CreatedWhen': todayS,
        'ModifiedWhen': nowS,
        'ModifiedBy': userEmail
      }
      var retS = writePropDetail(dbInst, tiRec);
  } catch (e) {
    Logger.log(`In ${fS}: ${e}`);
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
    Logger.log(`In ${fS}: ${e}`);
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
  var ret = evalTIResponses();

}
function displayTitlesAndIDS_(tiFormID) {
  var form = FormApp.openById(tiFormID);
  var items = form.getItems();
  for (var i in items) {
    console.log(items[i].getTitle() + ': ' + items[i].getId());
  }
}
function testPrintTitlesAndIDs() {
  var retS = displayTitlesAndIDS_('1sfdyrkMJ1b8oXjetqSjvsZSdcogEfDDKR3J0h8KWh9M');

}