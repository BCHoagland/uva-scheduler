function Time(starts, ends, days, name) {
  this.starts = starts;
  this.ends = ends;
  this.days = days;
  this.name = name;
}

var classNames = ['DSA 1', 'DSA 1 Lab', 'COA 1', 'COA 1 Lab', 'ENGR 1624', 'CHEM 1610', 'CHEM 1610 Discussion', 'CHEM 1611 Lab', 'APMA 2120'];
var classTimes = [[new Time([12, 12, 12], [13, 13, 13], [1, 3, 5])],
                  [new Time([18.5], [19.5], [3]), new Time([18.5], [19.5], [4])],
                  [new Time([14, 14, 14], [15, 15, 15], [1, 3, 5])],
                  [new Time([18.5], [19.5], [1]), new Time([18.5], [19.5], [2])],
                  [new Time([15.5, 15.5], [16.5, 16.5], [2, 4]), new Time([14, 14], [15, 15], [2, 4]), new Time([14, 14], [15, 15], [1, 5]), new Time([8, 8], [9, 9], [2, 4])],
                  [new Time([9, 9, 9], [10, 10, 10], [1, 3, 5]), new Time([14, 14], [15, 15], [2, 4]), new Time([15.5, 18.5], [16.5, 19.5], [2, 4])],
                  [new Time([18], [19.5], [1]), new Time([19.5], [21], [1]), new Time([18], [19.5], [2])],
                  [new Time([14], [17], [3]), new Time([14], [17], [1]), new Time([9], [12], [2]), new Time([14], [17], [2]), new Time([14], [17], [4]), new Time([14], [17], [5])],
                  [new Time([11, 11, 13, 11], [12, 12, 14, 12], [1, 3, 4, 5]), new Time([13, 13, 8.5, 13], [14, 14, 9.5, 14], [1, 3, 4, 5])]];
// var classNames = ['a', 'b', 'c'];
// var classTimes = [[new Time([12, 12, 12], [13, 13, 13], [1, 3, 5])],
//                   [new Time([8], [9], [3]), new Time([10], [11], [4])],
//                   [new Time([10, 11, 11], [11, 12, 12], [1, 3, 5])]];




var c = document.getElementById("schedule");
var ctx = c.getContext("2d");

ctx.font = "20px Helvetica";

var boxWidth = 200;
var hourHeight = 30;

var visibleCombo = 0;




function displaySchedule(names, times) {
  //input should be [class1, class2, ...] and [Time(), Time(), ...]
  ctx.clearRect(0, 0, 1600, 900);
  ctx.stroke();

  for (var i = 0; i < times.length; i++) {
    var startTime = times[i].starts;
    var endTime = times[i].ends;
    var duration = endTime - startTime;

    var day = times[i].days;
    ctx.fillStyle = "blue";
    ctx.fillRect(day * boxWidth + 20, startTime * hourHeight, boxWidth, duration * hourHeight);
    ctx.fillStyle = "white";
    ctx.fillText(times[i].name, day * boxWidth + 20, startTime * hourHeight + 20);
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

function showNextCombo() {
  if (w.length > 0) {
    displaySchedule(classNames, w[visibleCombo]);
    visibleCombo = (visibleCombo + 1) % w.length;
  }
}

var w = getWorkingSchedules(classNames, classTimes);
console.log(w);
