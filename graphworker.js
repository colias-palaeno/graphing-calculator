addEventListener("message", (ev) => {
  let xvals = ev.data.slice(0, 2).sort(function (a, b) {
    return a - b;
  });

  var maxval = xvals[1];
  var minval = xvals[0];

  var accuracy = ev.data[3];

  const func = new Function(
    "x",
    "if (isFinite(" +
      ev.data[2] +
      ") && " +
      ev.data[2] +
      " != 0){return " +
      ev.data[2] +
      ";} else return 0"
  );
  const audioGraphPush = (a, b, c) => {
    audioArray.push(Math.abs(Math.round(100 * (a / b) ** c) / 100));
    graphArray.push(func(i) - 1);
  };

  var audioArray = [];
  var graphArray = [];
  var pointArray = [];

  for (i = minval; i <= maxval; i += accuracy) {
    if (func(i) == 0) {
      audioGraphPush(1, 1, 1);
    } else {
      if (func(1) == 0) {
        audioGraphPush(func(i), 1, 0.2);
      } else {
        if (func(i) < 0) {
          audioArray.push(
            Math.abs(Math.round(100 * Math.abs(func(i) / func(1)) ** 0.2) / 100)
          );
          graphArray.push(func(i) - 1);
        } else {
          if (func(1) == 0) {
            audioGraphPush(func(i), 1, 0.2);
          } else {
            audioGraphPush(func(i), func(1), 0.2);
          }
        }
      }
    }
  }

  var squigHeight = Math.max(...graphArray) - Math.min(...graphArray);

  var yval = 0;

  for (j = 0; j < audioArray.length; j += accuracy) {
    if (minval < 0) {
      yval =
        squigHeight / 2 +
        func(minval) -
        func(1) -
        graphArray[j] -
        graphArray[0] +
        graphArray[0 - minval];
    } else {
      yval = squigHeight / 2 + func(minval) - func(1) - graphArray[j];
    } // "It just works" - Todd Howard

    pointArray.push([30 * (j - audioArray.length / 2 + 0.5), 30 * yval]);
  }

  postMessage([audioArray, pointArray, accuracy]);
});
