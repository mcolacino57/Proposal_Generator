/**
 * Purpose: takes an email that is in my contacts (derived from the form) and attempts to get the FullName and Broker License number, for use in handleSFBroker function in code.gs
 *
 * @param  {String} emailS - broker email in contacts
 * @return {array[]} brokerA - [brokerNameS,brokerLicenseS]
 */

function getBrokerInfo(emailS) {
  var cA = ContactsApp.getContactsByEmailAddress(emailS);  // an array of contacts
  var c = cA.filter(isBrokerLicense);
  if(c.length==0) {
    throw new Error("getBrokerLicense: no contact found");
  }
  var fullNameS = c[0].getFullName();
  var licenseS = c[0].getUserDefinedField("Broker License");
  if(!licenseS){ licenseS = "License Not Found"}

  return([fullNameS,licenseS]);
}

function isBrokerLicense(c) {
  var t = c.getUserDefinedField("Broker License");
  return t;
}
