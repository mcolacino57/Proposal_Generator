/* When the form changes, you need to: 
  update populateForm with the new q/a's

  CONTENTS
  populateForm()
  popFormText(qS, aS)
  popFormMulti(qS, aS)
  popFormDate(qS, aD)
  popFormCheck(qS, aL)
  returnItemNumber_(items, questionS)
  outputForm_(form)
  examineForm()
  getSectionHeaders(form)
  getItemResps(form)
 */
const CREATE_DOC = false;

/***************Utility and testing *************/

/**
 * Purpose create artificial data without user input into the form
 *
 * @param  {object} form - form
 * @return {integer} return - 1 if ok
 */

// update this when form is changed

/* populateForm takes a set of pre-defined responses and creates a form response with them. Uses four helper functions to deal with TEXT, MULTIPLE_CHOICE, DATE, and CHECK_BOX */
var newResponse, items;
function populateForm() {
  form.deleteAllResponses();
  newResponse = form.createResponse();
  items = form.getItems();
  popFormText_("What is the tenant name?", "the Tenant");
  popFormText_("Broker's ID?", "1");
  popFormMulti_("What will the Premises be used for?", "Office and Light Manufacturing");
  popFormDate_("Commencement Date?", new Date("01/10/2020"));
  popFormText_("Lease Term in Months?", "60");
  popFormText_("Period of Early Access?", "3 months");
  popFormMulti_("OpExp Base Year, Stop or Percentage?", "Operating Expense over Base Year");
  popFormMulti_("What year will be used for an Operating Expense Base Year?", "Calendar 2022");
  popFormMulti_("How will electric be charged?", "Rent Inclusion");
  popFormText_("What is the proposed electric charge per square foot?", "3.33");
  popFormMulti_("RET Base Year or Stop?", "Tax increases over a Base Year");
  popFormMulti_("What year will be used for a Real Estate Tax Base Year?", "Tax Year 2020/2021");
  popFormText_("Tenant Improvement Allowance in $/PSF?", "60.00");
  popFormCheck_("Any additional TI requirements?", ["TI Competitive Bid", "TI Freight"]);
  popFormText_("What is the monthly charge for Parking?", "$300 per car");
  popFormText_("How many months of rent will be provided as security?", "one");

  newResponse.submit();
  return true

}

/* Helper functions for populateForm */

function popFormText_(qS, aS) {
  var i = returnItemNumber_(items, qS);
  var textItem = items[i].asTextItem();
  itemResponse = textItem.createResponse(aS);
  newResponse.withItemResponse(itemResponse);
}
function popFormMulti_(qS, aS) {
  var i = returnItemNumber_(items, qS);
  var multiItem = items[i].asMultipleChoiceItem();
  itemResponse = multiItem.createResponse(aS);
  newResponse.withItemResponse(itemResponse);
}
function popFormDate_(qS, aD) {
  var i = returnItemNumber_(items, qS);
  var dateItem = items[i].asDateItem();
  itemResponse = dateItem.createResponse(aD);
  newResponse.withItemResponse(itemResponse);
}
function popFormCheck_(qS, aL) {
  var i = returnItemNumber_(items, qS);
  var checkItem = items[i].asCheckboxItem();
  itemResponse = checkItem.createResponse(aL);
  newResponse.withItemResponse(itemResponse);
}

/* Used by all four helper functions above to index into items with a particular question; returns the index or -1 if not found */
/**
 * Purpose
 *
 * @param  {objects} items - all the items in a form
 * @param  {string} questionS - an question string 
 * @return {number} # - return value; index or -1 if not found (error)
 */

function returnItemNumber_(items, questionS) {
  for (j = 0; j < items.length; j += 1) {
    if (items[j].getTitle() == questionS) { return j }
  }
  return -1
}

/*  Outputs all the questions, the type of the question (test, multi, date), and its item number*/
function outputForm_(form) {
  var items = form.getItems();
  var questionS;

  for (j = 0; j < items.length; j += 1) {
    var thisItem = items[j];
    var itemTypeIs = thisItem.getType();
    //console.log(itemTypeIs.toString());
    switch (itemTypeIs) {
      case FormApp.ItemType.TEXT:
        var textItem = thisItem.asTextItem();
        var questionS = textItem.getTitle();
        console.log(`Text item number ${j} is: ${questionS}`);
        break;
      case FormApp.ItemType.DATE:
        var dateItem = thisItem.asDateItem();
        var questionS = dateItem.getTitle();
        console.log(`Date item number ${j} is: ${questionS}`);
        break;
      case FormApp.ItemType.MULTIPLE_CHOICE:
        var multiItem = thisItem.asMultipleChoiceItem();
        var questionS = multiItem.getTitle();
        console.log(`Multi item number ${j} is: ${questionS}`);
        break;
      default:
        break;
    }
  }
  return 1
}

// logs all of the titles of items in a form 
function examineForm() {
  var fitems = form.getItems();
  for (var j = 0; j < fitems.length; j++) {
    console.log(`Item title for: #${j} - ${fitems[j].getTitle()} ID: ${fitems[j].getID()}`);
  }
}

/**
 * Purpose: get all the section headers for the form
 *
 * @param {object} form - the form
 * @return {array} retA - list of all the section headers
 */

function getSectionHeaders(form) {
  var fitems = form.getItems();
  for (var j = 0; j < fitems.length; j++) {
    var itm = fitems[j];
    var itemTypeIs = itm.getType();
    if (itemTypeIs == FormApp.ItemType.SECTION_HEADER) {

      var secItem = itm.asSectionHeaderItem();
      var questionS = secItem.getTitle();
      console.log(`Section item number ${j} is: ${questionS}`);
    }
  }
}

/**
 * Purpose: get a list of items from the form; assumes just one response. Change if there are multiple responsess
 * see getProto1Responses
 * @param  {object} form 
 * @return {object[]} retA - return all items from the form response
 *  
 **/
function getItemResps(form) {
  try {
    var formResponses = form.getResponses(); // assumed to be only one
    if (formResponses.length == 0) { throw new Error("getItemResps: formResponses has no responses") }
    if (formResponses.length > 1) { throw new Error("getItemResps: formResponses has too many responses") }
    var formResponse = formResponses[0]; //  
    var retA = formResponse.getItemResponses(); // array of items; which are questions and answers
  }
  catch (err) {
    console.log(`getItemResps: ${err}`);
    return { result: "Not Found" }
  }
  return retA
}

/**
 * Purpose
 *
 * @param  {string} param_name - param
 * @param  {itemReponse[]} param_name - an array of responses 
 * @return {string} retS - return value
 */

function extractItemID(f) {
  var items = f.getItems();
  for (var i in items) {
    console.log(items[i].getTitle() + ': ' + items[i].getId());
  }
}

function testExtractItemID() {
  var ret = extractItemID(parkform);
}




function responseByItemID(form, itemtosearch) {
  var formResponse = form.getResponses()[0]; // only expecting one response
  // loop through the form responses
  // get the item responses
  var itemResponses = formResponse.getItemResponses();
  for (var j = 0; j < itemResponses.length; j++) {
    var itemResponse = itemResponses[j];
    // test for the item number = searchterm
    if (itemResponse.getItem().getId() == itemtosearch) {
      return (itemResponse.getResponse())
    }
  }

}

function testResponseByItemID() {
  var unr = parkingObj['UnreservedNumber'];
  var retS = responseByItemID(parkform, unr);
  console.log(retS)
}

/*************************DROPDOWN INITIALIZATION******* */
/* used below by testPrintTitlesAndIDs() */
const proposalS = "Proposal to be used:"

const oeFormID = '1eQEOsPOHrrQuHMRKrTghjDggS7wrTWDr4L-YIQntBsk'; // Operating Expenses
const tiFormID = '1sfdyrkMJ1b8oXjetqSjvsZSdcogEfDDKR3J0h8KWh9M'; // Tenant Improvements
const poFormID = '1LcRF_WPTZ3bNudX6h_rdTzRARMRl7Rajf4gUR6JKPzA'; // Proposal Overview
const psFormID = '1ZVxqRKokgqTTfloI_zFBi59Sv7Q2NLDOB6fmoAcLAcE'; // Proposal Start

const tiDropdownID = '1210099673';
const oeDropdownID = '332505004';
const poDropdownID = '357079143';
const psDropdownID = '1120136627'; // used in fillSpacesDropdown below
/**
 * Purpose: take an array of strings and populate a dropdown in formID
 *
 * @param  {string} formID- form ID
 * @param  {string} dropDownID - id for the dropdown 
 * @return {string} retS - return "Success" or false
 */
function fillProposalDropdown_(formID, dropDownID) {
  const fS = "fillProposalDropdown_";
  var retS;
  try {
    // get proposal array from db
    var propA = getProposalNamesAndIDs("mcolacino@squarefoot.com");  // in gcloudSQL
    var ddvaluesA = propA.map(pr => {
      return pr[0];
    })

    // get the dropdown from the form
    var dd = FormApp.openById(formID).getItemById(dropDownID);
    var itemT = dd.getType();
    if (dd.getType() != FormApp.ItemType.LIST) {
      throw new Error(`Item: ${dropDownID} is not a list!`);
      return false
    }
    else {
      dd.asListItem().setChoiceValues(ddvaluesA);
    }

  } catch (err) {
    console.log(`In ${fS}: ${err}`)
    return false
  }
  retS = "Success";
  return retS
}

function runFillProposalDropDown() {
  var retS = fillProposalDropdown_(poFormID, poDropdownID);
}

/**
 * Purpose: Populate the spaces dropdown in the Proposal Start project
 *
 * @param  {string} formID- form ID
 * @param  {string} dropDownID - id string for dropdown
 * @return {string} retS - return "Success" or false
 */

function fillSpacesDropdown_(formID, dropDownID) {
  const fS = "fillSpacesDropdown_";
  var retS;
  try {
    // get proposal array from db
    var asfsfA = getSpaceDisplay("mcolacino@squarefoot.com");  // gcloudSQL modified to this 210708
    var ddvaluesA = asfsfA.map(pr => {
      return pr.sdesc;
    })
      // get the dropdown from the form
      var dd = FormApp.openById(formID).getItemById(dropDownID);
      var itemT = dd.getType();
      if (dd.getType() != FormApp.ItemType.LIST) {
        throw new Error(`Item: ${dropDownID} is not a list!`);
        return false
      }
      else {
        dd.asListItem().setChoiceValues(ddvaluesA);
        Logger.log(`Updated ${formID} with spaces`);
      }
  } catch (err) {
    console.log(`In ${fS}: ${err}`)
    return false
  }
  retS = "Success";
  return retS
}

function testFillSpacesDropdown() {
  var retS = fillSpacesDropdown_(psFormID, psDropdownID);
}

function displayTitlesAndIDS_(formID) {
  var form = FormApp.openById(formID);
  var items = form.getItems();
  for (var i in items) {
    console.log(items[i].getTitle() + ': ' + items[i].getId() + " / " + items[i].getHelpText());  // HelpText == Description
  }
}
function testPrintTitlesAndIDs() {
  var retS = displayTitlesAndIDS_(psFormID);

}


function crFormResponseArray(form) {
  // Use the global form ID and log the responses to each question.
  var respA = [];
  var formResponses = form.getResponses();
  // console.log("Number of responses is %s ", formResponses.length)
  for (var i = 0; i < formResponses.length; i++) {
    var formResponse = formResponses[i];
    var itemResponses = formResponse.getItemResponses();
    for (var j = 0; j < itemResponses.length; j++) {
      var itemResponse = itemResponses[j];
      respA.push({ "question": itemResponse.getItem().getTitle(), "answer": itemResponse.getResponse() });
    }
  }
  return respA
}

function testCrFormResponseArray() {
  var aS;
  var frA = crFormResponseArray(FormApp.openById(oeFormID));
  resp = frA.find((a) => a.question === 'How will electric be charged?');
  resp == undefined ? aS = "Sorry" : aS = resp.answer;
  console.log(aS)
}


/**
 * Purpose: Create array of objects with question, clausekey, replacement
 *
 * @param  {String} formID - string ID for form
 * @return {object[]} sectionA - return value
 */
/* assumes description (getHelpText) for each question in the form: 
key: <clausekey> / replacement: <replacement> */

function crFormKeyArray() {
  var fS = "crFormKeyArray";
  try {
    form = FormApp.getActiveForm()
    var items = form.getItems();
    var qcrA = [];
    for (var i in items) {
      if (items[i].getHelpText().includes("key: ")) {
        var question = items[i].getTitle();
        var [keyS, repS] = items[i].getHelpText().split(" / ");
        var clausekey = keyS.split(": ")[1];
        var replacement = repS.split(": ")[1];
        qcrA.push({ question, clausekey, replacement });
      }
    }
  } catch (e) {
    console.log(`In ${fS}: ${e}`);
    return false
  }
  // console.log(qcrA);
  return qcrA
}

function writeAllQuestionsKeys() {
  var fS = 'writeAllQuestionsKeys';
  var dbInst = new databaseC("applesmysql");
  try {
    var qcrA = crFormKeyArray();
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
    console.log(`In ${fS}: ${e}`);
    return false
  }
  return "Success"
}

