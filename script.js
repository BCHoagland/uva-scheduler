var classNames = [];
var classTimes = [];

var w = [];
var visibleCombo = 0;

var c = document.getElementById("schedule");
var ctx = c.getContext("2d");
// ctx.font = "40px Helvetica";

var boxWidth = $(window).width() * 0.68 / 7;
var hourHeight = 30;
var xOffset = 20;
var yOffset = 100;

var twelveHourTime = false;

function Time(starts, ends, days, name) {
  this.starts = starts;
  this.ends = ends;
  this.days = days;
  this.name = name;
}

$(document).ready(function() {
  c.width = $(window).width() * 0.7;
  c.height = $(window).height();
  $('#schedule').css('left', ($(window).width() * 0.3) + 'px');
});

$('#addInputBtn').click(function() {
  var container = document.getElementById('classInputs');
  var div = document.createElement('div');
  var i0 = document.createElement('input');
  i0.name = 'name';
  i0.type = 'text';
  var i1 = document.createElement('input');
  i1.name = 'days';
  i1.type = 'text';
  var i2 = document.createElement('input');
  i2.name = 'times';
  i2.type = 'text';

  div.appendChild(i0);
  div.appendChild(i1);
  div.appendChild(i2);
  container.appendChild(div);
});

function getFormSubstringFromIndex(str, sub, index) {
  var endIndex = str.indexOf("&", index);

  //if another element exists in the serialized form, the end index is the '&' separating it from the current element
  if (endIndex > -1) {
    return str.substring(index, endIndex);
  //if this is the last element, just return the current index to the end of the string
  } else {
    return str.substring(index);
  }
}

function dayStrToNum(str) {
  switch (str) {
    case "M":
      return 1;
      break;                        //TODO: DO YOU EVEN NEED THE BREAKS????
    case "T":
      return 2;
      break;
    case "W":
      return 3;
      break;
    case "R":
      return 4;
      break;
    case "F":
      return 5;
      break;
    default:
      return 0;
  }
}

$('#setCoursesBtn').click(function(event) {
  event.preventDefault();

  clearSchedule(true);

  var formData = $('#classInputs').serialize();
  formData = formData.replace(/%20/g, '');

  var nameIndex = formData.indexOf("name");
  var daysIndex = formData.indexOf("days");
  var timesIndex = formData.indexOf("times");

  var baseIndex = 0;

  var n = 0;

  while (nameIndex > -1 && daysIndex > -1 && timesIndex > -1) {
    var name = getFormSubstringFromIndex(formData, "name", nameIndex + 5);
    var days = getFormSubstringFromIndex(formData, "days", daysIndex + 5);
    var times = getFormSubstringFromIndex(formData, "times", timesIndex + 6);

    if (!(name == '' && days == '' && times == '')) {
      var isNewClass = name == '' ? false : true;

      //extract each day the class is being offered on
      var daysArr = [];
      for (var i = 0; i < days.length; i += 4) {
        daysArr.push(dayStrToNum(days.substring(i, i + 1)));
      }

      //extract each time the class is being offered for the given days
      var startArr = [];
      var endArr = [];

      var hyphenIndex = times.indexOf('-');
      var startTime = parseFloat(times.substring(0, hyphenIndex));
      var endTime = parseFloat(times.substring(hyphenIndex + 1));

      for (var i = 0; i < daysArr.length; i += 1) {
        startArr.push(startTime);
        endArr.push(endTime);
      }

      var entry = new Time(startArr, endArr, daysArr);
      if (isNewClass) {
        classNames.push(name);
        classTimes.push([entry]);
      } else {
        classTimes[classTimes.length - 1].push(entry);
      }
    }

    baseIndex = timesIndex + 5;
    var nameIndex = formData.indexOf("name", baseIndex);
    var daysIndex = formData.indexOf("days", baseIndex);
    var timesIndex = formData.indexOf("times", baseIndex);
  }

  w = getWorkingSchedules(classNames, classTimes);
  visibleCombo = 0;
});

function clearSchedule(clearArrs) {
  if (clearArrs) {
    classNames = [];
    classTimes = [];
    w = [];
  }
  ctx.clearRect(0, 0, c.width, c.height);
}

function displaySchedule(names, times) {

  function horizLine(y) {
    ctx.fillStyle = 'gray';
    ctx.strokeStyle = 'gray';

    ctx.beginPath();
    ctx.moveTo(xOffset, hourHeight * y + yOffset);
    if (y == 12) {
      ctx.fillStyle = 'black';
      ctx.strokeStyle = 'black';
    }
    ctx.lineTo(boxWidth * 7, hourHeight * y + yOffset);
    ctx.closePath();

    var yText = y;

    if (twelveHourTime) {
      if (y > 12) {
        yText = y - 12;
      } else if (y == 0) {
        yText = 12;
      }
    }
    ctx.fillText(yText, xOffset, hourHeight * y + yOffset);
    ctx.stroke();
  }

  function vertLine(x) {
    ctx.beginPath();
    ctx.moveTo(boxWidth * x + xOffset, yOffset);
    ctx.lineTo(boxWidth * x + xOffset, hourHeight * 24 + yOffset);
    ctx.closePath();
    ctx.stroke();
  }

  function box(x, y, duration, name) {
    ctx.fillStyle = 'blue';
    ctx.fillRect(x * boxWidth + xOffset, y * hourHeight + yOffset, boxWidth, duration * hourHeight);
    ctx.fillStyle = 'white';
    ctx.fillText(times[i].name, x * boxWidth + xOffset, y * hourHeight + yOffset + 20);
  }

  clearSchedule(false);

  for (var i = 0; i < 24; i++) {
    horizLine(i);
  }

  for (var i = 1; i < 7; i++) {
    vertLine(i);
  }

  for (var i = 0; i < times.length; i++) {
    var startTime = times[i].starts;
    var endTime = times[i].ends;
    var duration = endTime - startTime;
    var day = times[i].days;
    var name = times[i].name;

    box(day, startTime, duration, name);
    ctx.fillStyle = 'blue';
    ctx.fillRect(day * boxWidth + xOffset, startTime * hourHeight + yOffset, boxWidth, duration * hourHeight);
    ctx.fillStyle = 'white';
    ctx.fillText(times[i].name, day * boxWidth + xOffset, startTime * hourHeight + yOffset + 20);
  }

  ctx.stroke();
}

//return an array of all the combinations of indices of times
function getAllSchedules(times) {
  //store a 2D array that's kinda wack
  //if a class has three times, it'll get the value ['0', '1', '2']
  //all classes values will get added to the 'classCombos' array
  var classCombos = [];
  for (var i = 0; i < times.length; i++) {
    var arrayOfLengths = [];
    for (var j = 0; j < times[i].length; j++) {
      arrayOfLengths.push(j.toString());
    }
    classCombos.push(arrayOfLengths);
  }

  //returns the permutations of a given array of strings
  function getPermutation(array, prefix) {
      prefix = prefix || '';
      if (!array.length) {
          return prefix;
      }

      var result = array[0].reduce(function (result, value) {
          return result.concat(getPermutation(array.slice(1), prefix + value));
      }, []);
      return result;
  }

  //re-format the permutations of 'classCombos' to be a 2D array of type [[0, 1, 2, ...], [0, 1, 2, ...]] instead of a 1D array of ['012...', '012...']
  var strCombos = getPermutation(classCombos);
  var numCombos = [];
  for (var str of strCombos) {
    var tempArray = str.split('');
    for (var i = 0; i < tempArray.length; i++) {
      tempArray[i] = parseInt(tempArray[i]);
    }
    numCombos.push(tempArray);
  }

  return numCombos;
}

function getWorkingSchedules(names, times) {
  var allCombos = getAllSchedules(times);

  var workingCombos = [];
  for (var timeIndices of allCombos) {
    //selected times for each class (Time(starts, ends, days) for each class)
    var selectedTimes = [];
    for (var i = 0; i < timeIndices.length; i++) {
      var timeIndex = timeIndices[i];
      var selectedTime = times[i][timeIndex];
      selectedTimes.push(selectedTime);
    }

    var unpackedTimes = [];
    for (var i = 0; i < selectedTimes.length; i++) {
      var currentTime = selectedTimes[i];
      for (var j = 0; j < currentTime.days.length; j++) {
        var tempTime = new Time(currentTime.starts[j], currentTime.ends[j], currentTime.days[j], names[i]);
        unpackedTimes.push(tempTime);
      }
    }

    var compatible = true;
    for (var i = 0; i < unpackedTimes.length; i++) {
      var time1 = unpackedTimes[i];
      var start1 = time1.starts;
      var end1 = time1.ends;
      var day1 = time1.days;

      for (var j = i + 1; j < unpackedTimes.length; j++) {
        var time2 = unpackedTimes[j];
        var start2 = time2.starts;
        var end2 = time2.ends;
        var day2 = time2.days;

        if (day1 == day2) {
          if ((start1 >= start2 && start1 < end2) || (end1 > start2 && end1 <= end2)) {
            compatible = false;
          }
        }
      }
    }
    if (compatible) {
      workingCombos.push(unpackedTimes);
    }
  }

  return workingCombos;
}

$('#nextComboBtn').click(function() {
  showNextCombo();
});

function showNextCombo() {
  if (w.length > 0) {
    displaySchedule(classNames, w[visibleCombo]);
    visibleCombo = (visibleCombo + 1) % w.length;
  }
}
