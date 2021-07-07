
/**
 * Purpose: Read in json file fnameS
 *
 * @param  {String} param_name - param
 * @param  {itemReponse[]} param_name - an array of responses 
 * @return {String} retS - return value
 */

function getFileContent(fnameS) {
  const fS = "getFileContent";
  try{
  var files = DriveApp.getFilesByName(fnameS);
  if (files.hasNext()) {
    var file = files.next();
    var content = file.getBlob().getDataAsString();
    var json = JSON.parse(content);
    return json
  } 
} catch(e) {
  Logger.log(`In ${fS}: ${e}`);

}
  return false; // shouldn't get to here
}

function testGetFileContent(){
  var retj = getFileContent("mcolacino.json");
  console.log(retj["home_location"]);
  console.log(retj)
}