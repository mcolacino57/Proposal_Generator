

/**
 * Purpose: replace a chunk of text in the docInst, using replacement structure and replacement text
 *
 * @param  {String} replStructure - string in the form <<replace_me>>
 * @param  {String} replText - text to be replaced
 * @return {String}  retS - string including replacement structure
 */

function updateTemplateBody(replStructure, replText,docInst) {
  //Then we call replaceText method
  docInst.locBody.replaceText(replStructure, replText);
  var retS= `updateTemplateBody replaced ${replStructure}`;
  return retS
}


function formatCurrentDate() {
  return Utilities.formatDate(new Date(), "GMT+1", "yyyyMMdd");
}


