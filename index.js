const fs = require("fs");

fs.readFile("./nginx.log", (err, data) => {
  let logs = data.toString();

  logs = logs
    .split("\n")
    .filter(log => log.indexOf(" 500 ") > -1)
    .map(log => [getDateFromLog(log), log]);

  printLogs(parseLogs(logs));
});

const getLocalTime = (date = new Date()) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};

const getDateFromLog = log => {
  let date = log.substring(log.indexOf("[") + 1, log.indexOf("] "));
  let [day, month, date2] = date.split("/");
  date = date2.split(":");
  let [year, hour, minutes, seconds] = date;
  seconds = seconds.substr(0, seconds.indexOf(" "));

  date = `${month} ${day}, ${year} ${hour}:${minutes}:${seconds}`;

  return getLocalTime(new Date(date));
};

const diffDateInMinutes = (date1, date2) => {
  return Math.abs(date2.getTime() - date1.getTime()) / 100000;
};

const parseLogs = lines => {
  const logs = [];
  let refDate;

  for (let i = 0, n = lines.length; i < n; i++) {
    let [date, log] = lines[i];
    if (logs.length === 0) {
      refDate = lines[i][0];
      logs.push([log]);
    } else if (diffDateInMinutes(date, refDate) > 5) {
      refDate = lines[i][0];
      logs.push([log]);
    } else {
      logs[logs.length - 1].push(log);
    }
  }
  return logs;
};

const printLogs = logs => {
  for (let batch of logs) {
    console.log("\nNext batch:");

    for (let log of batch) {
      console.log(log);
    }
  }
};
