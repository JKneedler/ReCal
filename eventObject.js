function Event(title, description, startDate, endDate, allDay, startPos, height, weekDayIndex){
  this.title = title;
  this.description = description;
  this.startDate = startDate;
  this.endDate = endDate;
  this.allDay = allDay;
  this.startPos = startPos;
  this.height = height;
  this.weekDayIndex = weekDayIndex;
}

function Month(title, index, numOfDays){
  this.title = title;
  this.index = index;
  this.numOfDays = numOfDays;
}

function Week(dates, indexes){
  this.dates = dates;
  this.indexes = indexes;
}

function Day(date, month, year, index) {
  this.date = date;
  this.month = month;
  this.year = year;
  this.index = index;
}
