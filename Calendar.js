const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var curMonth = 0;
var curYear = 2018;
var curDay;
var curView = true;
var curWeek;
const hourSeparation = 30;
var draggingMouse = false;
var curDragEventDiv;
var curDragEvent; // name needs to change to curDragEvent
var creatingDragEvent = false;
var curDeleteEvent;

var weekEventDivs = [];
var weekEvents = [];

const eventModal = document.getElementById("eventModal");
const deleteModal = document.getElementById("deleteModal");

// Initialize Firebase

firebase.initializeApp(config);
var firestore = firebase.firestore();

const docRef = firestore.doc("users/JaredKneedler");
const saveEventButton = document.getElementById("saveEventButton");
const eventTitleInput = document.getElementById("eventTitle");
const eventDescriptionInput = document.getElementById("description");
const eventStartDateInput = document.getElementById("datepicker1");
const eventEndDateInput = document.getElementById("datepicker2");
const eventStartMinuteInput = document.getElementById("startMinute");
const eventStartHourInput = document.getElementById("startHour");
const eventEndMinuteInput = document.getElementById("endMinute");
const eventEndHourInput = document.getElementById("endHour");
const eventStartAMInput = document.getElementById("startam");
const eventStartPMInput = document.getElementById("startpm");
const eventEndAMInput = document.getElementById("endam");
const eventEndPMInput = document.getElementById("endpm");


saveEventButton.addEventListener("click", function() {
  const eventTitle = eventTitleInput.value;
  const eventDescription = eventDescriptionInput.value;
  var startDate = $("#datepicker1").datepicker('getDate');
  startDate = completeDate(startDate, eventStartHourInput.value, eventStartMinuteInput.value, eventStartAMInput.checked);
  var endDate = $("#datepicker2").datepicker('getDate');
  console.log(endDate.getDate());
  endDate = completeDate(endDate, eventEndHourInput.value, eventEndMinuteInput.value, eventEndAMInput.checked);
  var dateText = GenerateDateID(startDate);
  docRef.collection("Dates").doc(dateText).set({
    title: "day"
  }).then(function() {
    console.log("Data Saved!")
  }).catch(function(error) {
    console.log("Got an error: ", error);
  });
  var docName = GenerateEventDocID(startDate, endDate);
  docRef.collection("Dates").doc(dateText).collection("DayEvents").doc(docName).set({
    title: eventTitle,
    description: eventDescription,
    startDate: startDate,
    endDate: endDate,
    allDay: false
  }).then(function() {
    console.log("Data Saved!")
  }).catch(function(error) {
    console.log("Got an error: ", error);
  });
  creatingDragEvent = false;
  CloseModal();

  //Create the event node
  var parentDiv = document.getElementById("bigWeekView" + curDragEvent.weekDayIndex);
  var startPos = curDragEvent.startPos;
  var height = GetPositionFromTime(curDragEvent.endDate) - startPos;
  var title = eventTitle;
  CreateEventNode(title, startPos, height, parentDiv);
})

function ShowDeleteX(node) {
  node.getElementsByClassName("eventDeleteButton")[0].style.display = "block";
}

function RemoveDeleteX(node) {
  node.getElementsByClassName("eventDeleteButton")[0].style.display = "none";
}

function DeleteEventModal(node){
  curDeleteEvent = node.parentNode;
  OpenModal("deleteEvent");
}

window.onclick = function(event) {
  if(event.target == eventModal){
    CloseModal();
  }
}

function GenerateDateID(startDate){
  var dateText = "";
  if((startDate.getMonth()+1) < 10) {
    dateText += "0" + (startDate.getMonth()+1).toString();
  } else {
    dateText += (startDate.getMonth()+1).toString();
  }
  if(startDate.getDate() < 10) {
    dateText += "0" + startDate.getDate().toString();
  } else {
    dateText += startDate.getDate().toString();
  }
  dateText += startDate.getFullYear().toString();
  return dateText;
}

function GenerateEventDocID(startTime, endTime){
  var id = "";
  id += startTime.getHours() + startTime.getMinutes();
  id += startTime.getFullYear() + startTime.getMonth() + startTime.getDate();
  id += endTime.getHours() + endTime.getMinutes();
  id += endTime.getFullYear() + endTime.getMonth() + endTime.getDate();
  return id;
}

function OpenModal(type) {
  if(type == "createEvent"){
    eventModal.style.display = "block";
  } else if(type == "deleteEvent"){
    deleteModal.style.display = "block";
  }
}

function CloseModal(){
  eventModal.style.display = "none";
  deleteModal.style.display = "none";
  if(creatingDragEvent == true){
    curDragEventDiv.parentNode.removeChild(curDragEventDiv);
  }
}

document.getElementById("bigCalView").addEventListener("mousedown", function(e) {
  if(e.target.getAttribute("class") != "eventNode" || e.target.parentNode.getAttribute("class") != "eventNode"){
    draggingMouse = true;
    creatingDragEvent = true;

    //Get positions
    var offset = $("#bigWeekViewEvents").offset();
    var x = e.pageX;
    var windWidth = window.innerWidth;
    windWidth -= 350;
    let y = e.pageY - offset.top;
    var time = GetTimeFromPosition(y);
    var pos = GetPositionFromTime(time);
    var node = document.createElement("DIV");
    var dragEventDayIndex = Math.floor((x - 350) / (windWidth / 7));
    var dragDate = document.getElementById("weekViewDate" + dragEventDayIndex).innerHTML;
    var newTime = new Date(time);
    newTime.setMinutes(time.getMinutes() + 15);
    var heightPos = GetPositionFromTime(time);
    time.setDate(dragDate);
    time.setFullYear(curYear);
    time.setMonth(curMonth);
    console.log("time: " + time);
    //Create node with class and attributes
    node.setAttribute("class", "eventNode");
    curDragEventDiv = node;
    node.setAttribute("style", "top: " + pos + "; height: " + (heightPos - pos) + ";");
    document.getElementById("bigWeekView" + dragEventDayIndex).appendChild(node);
    //Rest
    curDragEvent = new Event("", "", time, newTime, false, pos, (heightPos-pos), dragEventDayIndex);
    console.log(curDragEvent.startDate);
  }
})

function TrackMouseMove(e){
  if(draggingMouse == true){
    //Get positions
    var offset = $("#bigWeekViewEvents").offset();
    let y = e.pageY - offset.top;
    var time = GetTimeFromPosition(y);
    var pos = GetPositionFromTime(time);
    if(pos == curDragEvent.startPos){
      time.setMinutes(time.getMinutes() + 15);
      pos = GetPositionFromTime(time);
    }
    curDragEvent.endDate.setHours(time.getHours());
    curDragEvent.endDate.setMinutes(time.getMinutes());
    curDragEvent.height = (pos - curDragEvent.startPos);
    curDragEventDiv.setAttribute("style", "top: " + curDragEvent.startPos + "; height: " + curDragEvent.height + ";");
  }
}

function GetTimeFromPosition(y){
  var timePos;
  var hour = 0;
  var minute = 0;
  if(y > 45 && y < 1150){
    timePos = Math.round((y - 45) / 12);
    hour = Math.floor((timePos/4)) + 1;
    minute = (timePos % 4) * 15;
  } else if(y > 0 && y < 1150){
    timePos = Math.round(y / 11.25);
    minute = (timePos % 4) * 15;
    if(y > 33.75){
      hour = 1;
      minute = 0;
    }
  }
  return new Date(2018, 1, 1, hour, minute);
}

function GetPositionFromTime(time){
  var position = 0;
  var hour = time.getHours();
  var minute = time.getMinutes();
  if(hour == 0){
    position = 11.25 * (minute / 15);
  } else {
    position = ((hour - 1) * 48) + ((minute / 15) * 12) + 35;
  }
  return position;
}

document.getElementById("bigCalView").addEventListener("mouseup", function(e) {
  if(draggingMouse){
    draggingMouse = false;
    var eventStartHour = curDragEvent.startDate.getHours();
    var eventEndHour = curDragEvent.endDate.getHours();
    if(eventStartHour > 12) {
      eventStartHour -= 12;
    }
    if(eventEndHour > 12){
      eventEndHour -= 12;
    }
    eventStartHourInput.value = eventStartHour;
    eventStartMinuteInput.value = curDragEvent.startDate.getMinutes();
    eventEndHourInput.value = eventEndHour;
    eventEndMinuteInput.value = curDragEvent.endDate.getMinutes();
    var eventMonth;
    var eventYear;
    var dayClass = document.getElementById("" + curWeek.indexes[curDragEvent.weekDayIndex]).getAttribute('class');
    if(dayClass == "monthDay"){
      eventMonth = curMonth;
      eventYear = curYear;
    } else if(dayClass == "prevMonthDay"){
      if(curMonth == 0){
        eventMonth = 11;
        eventYear = curYear - 1;
      } else {
        eventMonth = curMonth - 1;
        eventYear = curYear;
      }
    } else if(dayClass == "nextMonthDay"){
      if(curMonth == 11){
        eventMonth = 0;
        eventYear = curYear + 1;
      } else {
        eventMonth = curMonth + 1;
        eventYear = curYear;
      }
    }
    var eventDate = new Date(eventYear, eventMonth, curWeek.dates[curDragEvent.weekDayIndex]);
    $('#datepicker1').datepicker('setDate', eventDate);
    $('#datepicker2').datepicker('setDate', eventDate);
    OpenModal("createEvent");
  }
})

function completeDate(dateObject, hour, minute, am){
  if(!am){
    hour = parseInt(hour) + 12;
  }
  dateObject.setHours(hour);
  dateObject.setMinutes(minute);
  return dateObject;
}

function LoadProgram() {
  var today = new Date();
  curDay = new Day(today.getDate(), today.getMonth(), today.getFullYear(), 0);
  curMonth = curDay.month;
  curYear = curDay.year;
  DisplayCalendar();
  LoadHourLabels();
}

function DisplayCalendar(){
  var isLeapYear = IsLeapYear(curYear);
  var nextMonthYear = curYear;
  if(curMonth == 11) nextMonthYear += 1;
  var prevMonthYear = curYear;
  if(curMonth == 0) prevMonthYear -= 1;

  var prevMonthNum = curMonth -= 1;
  if(prevMonthNum == -1) prevMonthNum = 11;
  var nextMonthNum = curMonth += 1;
  if(nextMonthNum == 12) nextMonthNum = 0;

  const daysInPrevMonth = DaysInMonth(prevMonthNum, prevMonthYear);
  const daysInNextMonth = DaysInMonth(nextMonthNum, nextMonthYear);
  const daysInMonth = DaysInMonth(curMonth, isLeapYear);
  document.getElementById("month").innerHTML = months[curMonth]
  document.getElementById("year").innerHTML = curYear;

  var firstOfMonth = new Date(curYear, curMonth, 1);
  var firstDay = firstOfMonth.getDay();

  var dayCounter = 1;
  for(i = 0; i < 42; i++){
    const dayNumBeforeMonth = firstDay;
    var dayText = "";
    var dayLabel = document.getElementById(i.toString());
    dayLabel.removeAttribute("class");
    if(i >= firstDay && dayCounter <= daysInMonth){
      dayText = "" + dayCounter;
      if(curDay.date != 0 && curDay.date == dayCounter){
        DeactiveateDateDisplay(curDay.index);
        curDay.index = i;
        ActiveDateDisplay(curDay.index);
      }
      dayCounter++;
      dayLabel.setAttribute("class", "monthDay");
    } else if(i < firstDay){
      dayText = "" + (daysInPrevMonth - ((dayNumBeforeMonth - i) - 1));
      dayLabel.setAttribute("class", "prevMonthDay");
    } else if(dayCounter > daysInMonth){
      dayText = "" + (i - (daysInMonth + dayNumBeforeMonth - 1));
      dayLabel.setAttribute("class", "nextMonthDay");
    }
    dayLabel.innerHTML = dayText;
  }
  DisplayWeekView();
}

function LoadHourLabels() {
  for(i = 0; i < 23; i++){
    var pos = hourSeparation * (i+1);
    var text = i+1;
    if(i < 11){
      text = text.toString() + "am";
    } else if(i == 11) {
      text = text.toString() + "pm";
    } else if(i > 11) {
      text = (text-12).toString() + "pm";
    }
    var hourLabelDiv = document.getElementById("hourLabels");
    var node = document.createElement("SPAN");
    node.setAttribute("style", "text-align: center; position: relative; left: 0px; top: " + pos + "px; display: inline-block");
    var textNode = document.createTextNode(text);
    node.appendChild(textNode);
    hourLabelDiv.appendChild(node);
  }
}

function DisplayWeekView(){
  GetActiveWeek();
  for(k = 0; k < 7; k++){
    const dayIndex = "bigWeekView" + k;
    var weekDayDiv = document.getElementById(dayIndex);
    document.getElementById("weekViewDate" + k).innerHTML = curWeek.dates[k];
    while(weekDayDiv.firstChild){
      weekDayDiv.removeChild(weekDayDiv.firstChild);
    }
    AddEventNodes(k);
    for(i = 0; i < 23; i++){
      var pos = (hourSeparation + 8) * (i+1) - 4;
      var hr = document.createElement("HR");
      hr.setAttribute("style", "top: "+pos+"px; position: relative;")
      weekDayDiv.appendChild(hr);
    }
  }
}

function AddEventNodes(dayOfWeekIndex) {
  //CreateNameForDate
  var dateText = "";
  if((curMonth+1) < 10) {
    dateText += "0" + (curMonth+1).toString();
  } else {
    dateText += (curMonth+1).toString();
  }
  if(curWeek.dates[dayOfWeekIndex].length < 2) {
    dateText += "0" + curWeek.dates[dayOfWeekIndex].toString();
  } else {
    dateText += curWeek.dates[dayOfWeekIndex].toString();
  }
  dateText += curYear.toString();

  var weekDayDiv = document.getElementById("bigWeekView" + dayOfWeekIndex);

  //Get Date Data from Firebase and Create nodes for Data
  var dateDoc = docRef.collection("Dates").doc(dateText);
  dateDoc.collection("DayEvents").get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        var startTime = doc.data().startDate.getHours() + (doc.data().startDate.getMinutes() / 60);
        var endTime = doc.data().endDate.getHours() + (doc.data().endDate.getMinutes() / 60);
        var startPos = ((startTime-1) * 48) + 35;
        var height = (endTime - startTime) * 48;
        CreateEventNode(doc.data().title, startPos, height, weekDayDiv);
      });
  });
}

function CreateEventNode(title, startPos, height, parentDiv) {
  var node = document.createElement("DIV");
  var deleteButton = document.createElement("SPAN");
  var nodeText = document.createElement("P");
  nodeText.innerHTML = title;
  deleteButton.setAttribute("class", "eventDeleteButton");
  deleteButton.setAttribute("onclick", "DeleteEventModal(this)");
  deleteButton.innerHTML = "&times;";
  node.setAttribute("class", "eventNode");
  node.setAttribute("style", "top: " + startPos + "; height: " + height + ";");
  node.setAttribute("onmouseover", "ShowDeleteX(this)");
  node.setAttribute("onmouseleave", "RemoveDeleteX(this)");
  node.appendChild(nodeText);
  node.appendChild(deleteButton);
  parentDiv.appendChild(node);
}

function DeleteEvent() {
  //Delete the event
  console.log(curDeleteEvent);
  var startDate = GetTimeFromPosition(curDeleteEvent.getAttribute("top"));
  var bottom = curDeleteEvent.getAttribute("top") + curDeleteEvent.getAttribute("height");
  var endDate = GetTimeFromPosition(bottom);
  var dateText = GenerateDateID(startDate);
  var docName = GenerateEventDocID(startDate, endDate);
  console.log(startDate);
  console.log(endDate);
  console.log("dateText: " + dateText);
  console.log("docName: " + docName);
  docRef.collection("Dates").doc(dateText).collection("DayEvents").doc(docName).delete().then(function() {
    console.log("Document successfully deleted!");
  }).catch(function(error) {
    console.error("Error removing document: ", error);
  });
  CloseModal();
  curDeleteEvent.parentNode.removeChild(curDeleteEvent);
}

function GetItems(){
  var month = document.getElementById("monthText").value;
  var year = document.getElementById("yearText").value;
  this.curMonth = month;
  this.curYear = year;
  var days = DaysInMonth(month, IsLeapYear(year));
  document.getElementById("days").innerHTML = days;
  DisplayCalendar();
}

function GetActiveWeek(){
  const weekIndex = Math.floor((curDay.index+1)/7);
  const firstweekIndex = (weekIndex * 7) - 1;
  var weekIndexes = [0, 0, 0, 0, 0, 0, 0];
  var weekDates = [0, 0, 0, 0, 0, 0, 0];
  for(i = 0; i < 7; i++){
    weekIndexes[i] = (weekIndex * 7) + i;
    weekDates[i] = document.getElementById(weekIndexes[i].toString()).innerHTML;
  }
  curWeek = new Week(weekDates, weekIndexes);
  console.log(curWeek);
}

function IsLeapYear(curYear){
  var isLeapYear = false;
  if(curYear % 4 == 0){
    if(curYear % 100 == 0){
      if(curYear % 400 == 0){
        isLeapYear = true;
      }
    } else {
      isLeapYear = true;
    }
  }
  return isLeapYear;
}

function DaysInMonth(curMonth, isLeapYear){
  var days = daysInMonths[curMonth];
  if(isLeapYear && curMonth == 1){
    days = 29;
  }
  return days;
}

function ChangeMonth(direction){
  if(direction == 0){
    if(curMonth == 0){
      curMonth = 11;
      curYear--;
    } else {
      curMonth--;
    }
  } else {
    if(curMonth == 11){
      curMonth = 0;
      curYear++;
    } else {
      curMonth++;
    }
  }
  curDay.month = curMonth;
  DisplayCalendar();
}

function ClickedDate(calIndex){
  DeactiveateDateDisplay(curDay.index);
  var newActiveDate = document.getElementById(calIndex.toString());
  curDay.date = newActiveDate.innerHTML;
  if(newActiveDate.getAttribute("class") == "nextMonthDay"){
    ChangeMonth(1);
  } else if(newActiveDate.getAttribute("class") == "prevMonthDay"){
    ChangeMonth(0);
  } else {
    curDay.index = calIndex;
    curDay.date = newActiveDate.innerHTML;
    ActiveDateDisplay(curDay.index);
    GetActiveWeek();
    DisplayWeekView();
  }
  console.log(curDay);
}

function ActiveDateDisplay(index){
  document.getElementById(index.toString()).style.outline = "2px solid black";
}

function DeactiveateDateDisplay(index){
  document.getElementById(index.toString()).style.outline = "none";
}

function addItem(){
  var parent = document.getElementById("testlist");
  var para = document.createElement("p");
  var node = document.createTextNode("This is new.");
  para.appendChild(node);
  var listItem = document.createElement("li");
  listItem.setAttribute("id", "testItem");
  listItem.appendChild(para);
  parent.appendChild(listItem);
}

function removeItem(){
  var child = document.getElementById("testItem");
  child.parentNode.removeChild(child);
}

function switchView(){
  var calView = document.getElementById("bigCalView");
  var todoView = document.getElementById("bigTodoView");
  if(curView == true){
    curView = false;
    calView.style.display = "none";
    todoView.style.display = "block";
  } else if(curView == false){
    curView = true;
    calView.style.display = "block";
    todoView.style.display = "none";
  }
}
