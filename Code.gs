function doGet() {
  return HtmlService.createHtmlOutputFromFile('Main');
}

function postDataCreateSheets(retrievedDataObj) {
  const spreadsheetID = "1aATYS0ERDMA6rwRWwtJTZWVX2q8sbaTTPlTa5L3d1bk";
  const spreadsheet = SpreadsheetApp.openById(spreadsheetID);

  const retrievedDataObjKeys = Object.keys(retrievedDataObj);
  const randomKey = retrievedDataObjKeys[0];
  
  const date = retrievedDataObj[randomKey]["date"];
  const parsedDateArr = date.split("-");
  const year = parsedDateArr[0];
  const month = parsedDateArr[1];
  const dd = parsedDateArr[2];

  const dateObjTest = new Date();
  dateObjTest.setFullYear(year);
  dateObjTest.setMonth(month-1);
  dateObjTest.setDate(dd);

  const monthText = dateObjTest.toLocaleString('en-US', { month: 'long' });
  const textDate = `${monthText} ${year}`;
  

  function findCreateSheet(){
    const sheet = spreadsheet.getSheetByName(textDate);
    
    if (!sheet) {


      const sheetNew = spreadsheet.insertSheet(textDate);
      sheetNew.setName(textDate);

      //Formatting the sheet.
      const maxRows = sheetNew.getMaxRows();
      const maxColumns = sheetNew.getMaxColumns();
      const range = sheetNew.getRange(1,1,maxRows,maxColumns);

      sheetNew.setFrozenRows(1);

      range.setFontSize(15);
      range.setHorizontalAlignment("center");
      range.setVerticalAlignment("middle");
      range.setNumberFormat("@");
   
      const columnNum = 6;

      for (let i = 0; i < columnNum; i++) {

        const textRange = sheetNew.getRange(1,i+1,1,1);

        let widthToSet = 0;

        if (i==0) {
          widthToSet = 150;
          textRange.setValue("Input Date");
        } else if (i==1) {
          widthToSet = 160;
          textRange.setValue("Teacher");
        } else if (i==2) {
          widthToSet = 57;
          textRange.setValue("Class");
        } else if (i==3) {
          widthToSet = 95;
          textRange.setValue("Time");
        } else if (i==4) {
          widthToSet = 600;
          textRange.setValue("Absent students");
        } else if (i==5) {
          textRange.setValue("Teacher notes");
          widthToSet = 300;
        }

        sheetNew.setColumnWidth(i+1, widthToSet);
      }

      insertData(sheetNew);

    } else {

      insertData(sheet);

    }
  }


  function insertData (sheet) {

    //We got the last row where data is, now post in the next row..
    const columnNum = 6;
    const keys = Object.keys(retrievedDataObj);
    const rowNum = keys.length;

    for (let f = 0; f < rowNum; f++) {
      const dataRange = sheet.getDataRange();
      const rowToPost = dataRange.getLastRow() + 1;

      const timeKey = keys[f];
      const inputDate = `${month}/${dd}/${year}`;
      const teacherName = retrievedDataObj[timeKey]["teacherName"];
      const classType = retrievedDataObj[timeKey]["classType"];
      let absentStudents = retrievedDataObj[timeKey]["absentStudentsList"];

      if (absentStudents) {
        absentStudents = absentStudents.toString();
      }

      let duplicateFound = false;

      let duplicateIndex = 0;

      function confirmDataRepetition() {
        const dataRowsNum = dataRange.getLastRow();

        const searchRangeDates = sheet.getRange(2,1,dataRowsNum,1);
        const valuesDates = searchRangeDates.getValues();
        const flatValuesDates = valuesDates.flat();

        const searchRangeTime = sheet.getRange(2,4,dataRowsNum,1);
        const valuesTime = searchRangeTime.getValues();
        const flatValuesTime = valuesTime.flat();

        const searchRangeTeacher = sheet.getRange(2,2,dataRowsNum,1);
        const valuesTeacher = searchRangeTeacher.getValues();
        const flatValuesTeacher = valuesTeacher.flat();

        for (let n = 0; n < dataRowsNum; n++) {
          const curDatVal = flatValuesDates[n];
          const curTimeVal = flatValuesTime[n];
          const curTeacherVal = flatValuesTeacher[n];

          Logger.log(curDatVal);
          Logger.log(curTimeVal);
          Logger.log(curTeacherVal);

          if (curDatVal === inputDate && curTimeVal === timeKey && curTeacherVal === teacherName) {
              duplicateIndex = n;
              duplicateFound = true;
              break;
          }         
        }

      }

      confirmDataRepetition();

      const notes = retrievedDataObj[timeKey]["noteField"];

      //Choosing behavior based on absence or presense of duplicate data.
      if (duplicateFound == false) {
        postValues(rowToPost);
      } else {
        postValues(duplicateIndex+2); //To account for index changes and the scope.
    }


    function postValues (rowNum) {
      for (let i = 0; i < columnNum; i++) {
        const columnToPost = i+1;

        const curRange = sheet.getRange(rowNum,columnToPost,1,1);
        let valueToPost = 0;

        if (i==0) {
          valueToPost = inputDate;
        } else if (i==1) {
          valueToPost = teacherName;
        } else if (i==2) {
          valueToPost = classType;
        } else if (i==3) {
          valueToPost = timeKey;
        } else if (i==4) {
          valueToPost = absentStudents;
        } else if (i==5) {
          valueToPost = notes;
        }
        curRange.setValue(valueToPost);
      }


    }


    }

  }


  findCreateSheet();
}

function confirmRetrievedData (retrievedDataObj) {
  const retrievedDataObjKeys = Object.keys(retrievedDataObj);
  const randomKey = retrievedDataObjKeys[0];

  if (retrievedDataObj[randomKey]["header"] == 1) {
    postDataCreateSheets(retrievedDataObj);
  } else {
    Logger.log("Data has not been retrieved succesfully.");
  }
  
}
