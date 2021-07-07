// Load moment library
eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js').getContentText());


/**
 * Takes a raw CSV string and converts it to a JavaScript object.
 * @param {string} string The raw CSV string.
 * @param {string[]} headers An optional array of headers to use. If none are
 * given, they are pulled from the file.
 * @param {string} quoteChar A character to use as the encapsulating character.
 * @param {string} delimiter A character to use between columns.
 * @returns {object[]} An array of JavaScript objects containing headers as keys
 * and row entries as values.
 */
const csvToJson = (string, headers, quoteChar = '"', delimiter = ',') => {
  const regex = new RegExp(`\\s*(${quoteChar})?(.*?)\\1\\s*(?:${delimiter}|$)`, 'gs');
  const match = string => [...string.matchAll(regex)].map(match => match[2])
    .filter((_, i, a) => i < a.length - 1); // cut off blank match at end

  const lines = string.split('\n');
  const heads = headers || match(lines.splice(0, 1)[0]);

  return lines.map(line => match(line).reduce((acc, cur, i) => ({
    ...acc,
    [heads[i] || `extra_${i}`]: (cur.length > 0) ? (Number(cur) || cur) : null
  }), {}));
}

/**
 * Purpose
 *
 * @param  {string} fileNameS - file to extract
 * @return {stri g} retS - return value
 */
const importDateFormat = 'MM/DD/YY HH:mm';
const outputDateFormat = 'YYYY-MM-DD HH:mm';
function transDatesFromCSVClauses() {
  var f = DriveApp.getFilesByName("clauses.csv");
  var csv = f.next().getBlob().getDataAsString(); // gets first file that matches fileNameS; should check
  var jsonObj = csvToJson(csv);
  var rows = [], data;
  for (i = 0; i < jsonObj.length; i++) {
    data = jsonObj[i];
    // convert the dates to the ISO format that import likes
    var crDate = data["CreatedWhen"];
    var modDate = data["ModifiedWhen"];
    var createdWhen = moment(crDate, importDateFormat).format(outputDateFormat);
    var modifiedWhen = moment(modDate, importDateFormat).format(outputDateFormat);
    rows.push(
      [data["ClauseKey"],
      data["Location"],
      data["Section"],
      data["ClauseBody"],
      data["CreatedBy"],
      createdWhen,
      modifiedWhen,
      data["LastModifiedBy"]
      ]);
  }
  var header = Object.keys(jsonObj[0])
  return [header, rows]

}


/****************testing and globals************ */
const testString = `name,age,quote
John,,Hello World
Mary,23,""Alas, What Can I do?""
Joseph,45,"Waiting, waiting, waiting"
"Donaldson Jones"   , sixteen,    ""Hello, "my" friend!""`;

// console.log(csvToJson(testString));
// console.log(csvToJson(testString, ['foo', 'bar', 'baz']));
// console.log(csvToJson(testString, ['col_0']));


function saveAsCSV(fileNameS, data) {
  fileName = fileNameS + ".csv";
  // Convert the range data to CSV format
  var csvFile = convertObjectToFile(fileName, data);
  // Create a file in Drive with the given name, the CSV data and MimeType (file type)
  DriveApp.createFile(fileName, csvFile, MimeType.CSV);
}
function convertObjectToFile(csvFileName, data) {
  try {

    if (data.length > 1) {
      var csv = "";
      for (var row = 0; row < data.length; row++) {
        for (var col = 0; col < data[row].length; col++) {
          if (data[row][col] == null) { continue };
          var tmp1 = data[row][col].toString();
          var tmp2 = data[row][col].toString().indexOf(",");
          if (data[row][col].toString().indexOf(",") != -1) {
            var tmp3 = data[row][col] = "\"" + data[row][col] + "\"";
          }
        }
        // Join each row's columns
        // Add a carriage return to end of each row, except for the last one
        if (row < data.length - 1) {
          csv += data[row].join(",") + "\r\n";
        }
        else {
          csv += data[row];
        }
      }
      var csvFile = csv;

    }
    return csvFile;
  }
  catch (err) {
    console.log(err);
  }
}

