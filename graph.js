import zim from "https://zimjs.org/cdn/00/zim";

const frame = new Frame(FIT, 1920, 1080, black, black);
frame.on("ready", () => {
  const stage = frame.stage;
  let stageW = frame.width;
  let stageH = frame.height;

  const audio = new Audio("beep.wav");
  audio.preservesPitch = false;
  const worker = new Worker("graphworker.js");

  const container = new Container().loc(960, 540);

  let canplaythrough = false;

  audio.addEventListener("canplaythrough", () => {
    canplaythrough = true;
  });

  function audioPausedandPlayable() {
    return new Promise((resolve) => {
      if (audio.paused) {
        resolve();
      } else {
        audio.addEventListener("ended", () => {
          resolve();
        });
      }
    });
  }

  const TIprops = {
    backgroundColor: white,
    color: black,
    font: "Bahnschrift SemiBold"
  };

  const xcoord1box = new TextInput(TIprops).centerReg(container);

  const xcoord2box = new TextInput(TIprops).centerReg(container).mov(0, -100);

  const funcbox = new TextInput(TIprops).centerReg(container).mov(0, 150);
  funcbox.label.color = black;

  /* const xcoord2box = xcoord1box.duplicate().mov(0,-200);
     const funcbox = xcoord1box.duplicate().mov(0,200); - error w/ duplicating @ 
     https://cdn.discordapp.com/attachments/782980828866674759/997889458760335420/unknown.png */

  const button = new Button({
    backgroundColor: white,
    width: 300,
    height: 90,
    label: new Label("Graph", 50, "Bahnschrift SemiBold", black)
  })
    .centerReg(container)
    .mov(0, 300);

  const squiggle = new Squiggle({
    showControls: false,
    lockControls: true,
    interactive: false,
    points: [
      [0, 0],
      [1, 1]
    ]
  })
    .centerReg()
    .bot()
    .alp(0);

  const squigIntro = new Squiggle({
    thickness: 30,
    showControls: false,
    lockControls: true,
    interactive: false,
    points: [
      [-900, 31, 0, 0, -50, 0, 50, 0],
      [-160, 328, 0, 0, -270, 160, 270, -159],
      [1250, -263, 0, 0, -770, -54, 770, 54]
    ]
    // cool wave! :D
  }).centerReg();

  const circle = new Circle({
    radius: 60,
    color: yellow
  }).centerReg();

  container.alp(0);

  let accuracy = 1;

  const title = new Label(
    "a graphing calculator",
    160,
    "Bahnschrift SemiBold",
    white
  )
    .centerReg()
    .top()
    .alp(0);

  const textByBoxesContainer = new Container().pos(-300, 540);

  const textByCoordBoxes = new Label(
    "Coordinate 1\n\nCoordinate 2",
    50,
    "Bahnschrift SemiBold",
    white,
    null,
    null,
    null,
    RIGHT
  )
    .centerReg(textByBoxesContainer)
    .mov(0, -42);
  const textByFuncBox = new Label(
    "Function",
    50,
    "Bahnschrift SemiBold",
    "CornflowerBlue"
  )
    .centerReg(textByBoxesContainer)
    .mov(50, 141);

  circle.animate({
    props: { path: squigIntro },
    time: 6,
    ease: "quintInOut",
    call: () => {
      circle.radius = 10;
      squigIntro.animate({
        props: { y: 1450 },
        ease: "quintInOut"
      });
    }
  });

  title.animate({
    props: { alpha: 1 },
    time: 2,
    rewind: true,
    call: () => {
      title.text = "by ALIAS";
      title.centerReg().animate({
        props: { alpha: 1 },
        time: 2,
        call: () => {
          audio.play();
          title.animate({
            props: { y: 1400 },
            ease: "quintInOut",
            call: () => {
              squigIntro.removeFrom();
              textByBoxesContainer.animate({
                props: { x: 620 },
                ease: "quintInOut",
                call: () => {
                  textByBoxesContainer.addTo(container);
                }
              });
              container.animate({
                props: { alpha: 1 }
              });
            }
          });
        }
      });
    }
  });

  button.tap(() => {
    let boxtextArray = [
      xcoord1box.label.text,
      xcoord2box.label.text,
      funcbox.label.text
    ];
    if (
      boxtextArray.every((e) => e != "") &&
      boxtextArray.slice(0, 1).every((e) => isFinite(e)) &&
      Math.round(xcoord1box.label.text) != Math.round(xcoord2box.label.text) &&
      audioPausedandPlayable()
    ) {
      container.animate({
        props: { alpha: 0 },
        time: 0.3,
        call: () => {
          worker.postMessage([
            Math.round(xcoord1box.label.text),
            Math.round(xcoord2box.label.text),
            funcbox.label.text,
            accuracy
          ]);
        }
      });
    } else {
      audio.playbackRate = 0.8;
      audio.play();
    }
  });

  textByFuncBox.tap((e) => {
    window.open(
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math#static_methods",
      "_blank"
    );
    e.target.color = "Orchid";
  });

  new Container().loc(960, 540);

  worker.onmessage = async function (ev) {
    let audioArray = ev.data[0];
    let pointArray = ev.data[1];
    let accuracy = ev.data[2];

    squiggle.points = pointArray;

    squiggle
      .animate({
        props: { alpha: 1 },
        time: 0.5
      })
      .centerReg();

    circle.alp(1).animate({
      props: { path: squiggle },
      ease: "quintInOut",
      time:
        audio.duration * audioArray.map((e) => 1 / e).reduce((a, b) => a + b),
      call: () => {
        container.animate({
          props: { alpha: 1 },
          time: 0.5
        });
        squiggle.animate({
          props: { alpha: 0 },
          time: 0.5
        });
        circle.animate({
          props: { alpha: 0 },
          time: 0.5
        });
      }
    });

    for (let i = 0; i < audioArray.length; i += accuracy) {
      await audioPausedandPlayable();
      audio.playbackRate = audioArray[i];
      audio.play();
    }
  };

  stage.update();
});
