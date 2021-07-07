const todayS = Utilities.formatDate(new Date(), "GMT-4", "yyyy-MM-dd");
const nowS = Utilities.formatDate(new Date(), "GMT-4", "yyyy-MM-dd HH:MM:ss");
const userEmail = Session.getActiveUser().getEmail();
ssLogID = '1-k1GN03pdh9GKjohX3Pet6ahHPmaxfur5Y1Hw41rxTA';
Logger = BetterLog.useSpreadsheet(ssLogID);


function onSubmit() {
  var retS = evalOEResponses();
}

/**
 * Purpose: Evaluate responses to this form and write records to prop_detail table
 * Calls evalOE, evalRET, evalElec functions
 *
 * @return {String} retS - Success
 */

function evalOEResponses() {
  const fS = "evalOEResponses";
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
    //eval operating expenses
    retS = evalOE(propS, dbInst, respA);
    retS = evalRET(propS, dbInst, respA);
    retS = evalElec(propS, dbInst, respA);
  } catch (e) {
    Logger.log(`In ${fS}: ${e}`);
    return "Problem"
  }
  return "Success"
}

/**
 * Purpose: Evaluate operating expense responses from the OE form
 *
 * @param  {string} propS - proposal name string
 * @param  {object} dbInst - instance of databaseC
 * @param {object[]} respA - response array
 * @return {string} retS - Success or Problem
 */
const logEvalOE = false;
function evalOE(propS, dbInst, respA) {
  var fS = 'evalOE';
  const oeQS = "OpExp Base Year, Percentage?";
  var oeS, oeQuestionS, oeAnswerS;
  try {
    var oeO = respA.find((responseObj) => responseObj.question === oeQS);
    oeO == undefined ? oeS = "No operating expense q in form" : oeS = oeO.answer;
    switch (oeS) {
      case 'Operating Expense over Base Year':
        oeQuestionS = 'Operating Expense Base Year?';
        break;
      case 'Operating Expense Percentage Escalation':
        oeQuestionS = 'Annual Operating Expense Percentage Escalation?';
        break;
      default: // additional possibilities go here
        break;
    }
    oeO = respA.find((responseObj) => responseObj.question === oeQuestionS);
    oeO == undefined ? oeAnswerS = "No operating expense q in form" : oeAnswerS = oeO.answer;
    var oeClauseKey = questionToClauseKey(dbInst, oeQuestionS);
    if (oeClauseKey == undefined) { throw new Error(`Unable to find ClauseKey`) }
    var oeRec = {
      'ProposalName': propS,
      'ProposalClauseKey': oeClauseKey,
      'ProposalQuestion': oeQuestionS,
      'ProposalAnswer': oeAnswerS,
      'CreatedBy': userEmail,
      'CreatedWhen': todayS,
      'ModifiedWhen': nowS,
      'ModifiedBy': userEmail
    }
    var retS = writePropDetail(dbInst, oeRec);
  } catch (e) {
    Logger.log(`In ${fS}: ${e}`);
    return "Problem"
  }
  return "Success"
}

/**
 * Purpose: Evaluate real estate taxes from the OE form
 *
 * @param  {String} propS - proposal name 
 * @param  {object} dbInst - instance of databaseC
 * @param  {object[]} respA - array of responses in structure
 * @return {String} retS - return value
 */
function evalRET(propS, dbInst, respA) {
  var fS = 'evalRET';
  var reQS = 'Real Estate Tax Base Year?';
  try {
    var reO = respA.find((responseObj) => responseObj.question === reQS);
    reO == undefined ? reS = "No real estate taxes q in form" : reS = reO.answer;
    var reClauseKey = questionToClauseKey(dbInst, reQS);
    if (reClauseKey == undefined) { throw new Error(`Unable to find ClauseKey`) }
    var reRec = {
      'ProposalName': propS,
      'ProposalClauseKey': reClauseKey,
      'ProposalQuestion': reQS,
      'ProposalAnswer': reS,
      'CreatedBy': userEmail,
      'CreatedWhen': todayS,
      'ModifiedWhen': nowS,
      'ModifiedBy': userEmail
    }
    var retS = writePropDetail(dbInst, reRec);

  } catch (e) {
    Logger.log(`In ${fS}: ${e}`);
    return "Problem"
  }
  return "Success"
}

/**
 * Purpose: Evaluate electric responses from the OE form
 *
 * @param  {object} dbInst - instance of databaseC
 * @param  {itemReponse[]} respA - an array of responses 
 * @return {String} retS - return value
 */
function evalElec(propS, dbInst, respA) {
  var fS = 'evalElec';
  const elQS = "How will electric be charged?";
  var elS, elQuestionS, elAnswerS, elClauseKey;
  try {
    var elO = respA.find((responseObj) => responseObj.question === elQS);
    elO == undefined ? elS = "No electric q in form" : elS = elO.answer;
    if (elS == 'Rent Inclusion') {
      elQuestionS = 'What is the proposed electric charge per square foot?';
      elO = respA.find((responseObj) => responseObj.question === elQuestionS);
      elO == undefined ? elAnswerS = "No operating expense q in form" : elAnswerS = elO.answer;
    } else {
      elQuestionS = elS + "?";   // No real question; generate one from original answer
      elAnswerS = elS;
    }
    var elClauseKey = questionToClauseKey(dbInst, elQuestionS);
    if (elClauseKey == undefined) { throw new Error(`Unable to find ClauseKey`) }
    var elRec = {
      'ProposalName': propS,
      'ProposalClauseKey': elClauseKey,
      'ProposalQuestion': elQuestionS,
      'ProposalAnswer': elAnswerS,
      'CreatedBy': userEmail,
      'CreatedWhen': todayS,
      'ModifiedWhen': nowS,
      'ModifiedBy': userEmail
    }
    var retS = writePropDetail(dbInst, elRec);
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
    console.log(`In ${fS}: ${e}`);
  }
  return retS
}


/**
 * Purpose: Create array of objects with question, clausekey, replacement
 *
 * @param  {String} formID - string ID for form
 * @return {object[]} sectionA - return value
 */
/* assumes description (getHelpText) for each question in the form: 
key: <clausekey> / replacement: <replacement> 
HOWEVER, Electric is different and requires an additional parsing step
*/

function crOEFormKeyArray() {
  var fS = "crFormKeyArray";
  try {
    form = FormApp.getActiveForm()
    var items = form.getItems();
    var qcrA = [];
    for (var i in items) {
      if (items[i].getHelpText().includes("key: ")) {
        var question = items[i].getTitle();
        if (question == "How will electric be charged?") {
          var elecSplitA = items[i].getHelpText().split(" / "); // should be three
          // specific to electric
          question = "Direct Meter?"
          var clausekey = elecSplitA[0].split(": ")[1];
          var replacement = "<<" + clausekey + ">>";
          qcrA.push({ question, clausekey, replacement });

          question = "Sub Meter?";
          clausekey = elecSplitA[1].split(": ")[1];
          var replacement = "<<" + clausekey + ">>";
          qcrA.push({ question, clausekey, replacement });

        } else {
          var [keyS, repS] = items[i].getHelpText().split(" / ");
          var clausekey = keyS.split(": ")[1];
          var replacement = repS.split(": ")[1];
          qcrA.push({ question, clausekey, replacement });
        }
      }
    }
  } catch (e) {
    Logger.log(`In ${fS}: ${e}`);
    return false
  }
  //console.log(qcrA);
  return qcrA
}

function writeAllOEQuestionsKeys() {
  var fS = 'writeAllOEQuestionsKeys';
  var dbInst = new databaseC("applesmysql");
  try {
    var qcrA = crOEFormKeyArray();
    if (qcrA) {
      qcrA.forEach(r => {
        var qcrRec = {
          'Question': r.question,
          'ClauseKey': r.clausekey,
          'ReplStruct': r.replacement,
          'CreatedBy': userEmail,
          'CreatedWhen': todayS,
          'ModifiedWhen': nowS,
          'ModifiedBy': userEmail
        }
        var rets = writeCk_Question(dbInst, qcrRec)
      })
    }
  } catch (e) {
    Logger.log(`In ${fS}: ${e}`);
    return false
  }
  return "Success"
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
  var ret = evalOEResponses();

}