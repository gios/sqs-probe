exports.parseJSON = str => {
  try {
    JSON.parse(str);
  } catch (e) {
    throw new Error("invalid json");
  }
  return JSON.parse(str);
};

exports.hrtimeToString = hrtime => {
  return `${hrtime[0]}s ${hrtime[1] / 1000000}ms`;
};

exports.hrtimeAdd = (hrtime1, hrtime2) => {
  const NANOSECONDS_TO_SECOND = 1e9;
  let seconds = hrtime1[0] + hrtime2[0];
  let nanoseconds = hrtime1[1] + hrtime2[1];

  if (nanoseconds > NANOSECONDS_TO_SECOND) {
    seconds += 1;
    nanoseconds -= NANOSECONDS_TO_SECOND;
  }
  return [seconds, nanoseconds];
};
