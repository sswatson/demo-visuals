
import { useState } from "react";
import { type Node, GraphAnimation } from "./components/GraphAnimation";

const memeSpreadNodes: Node[] = [
  { id: 0, x: "20%", y: "50%", step: 0, origin: 0, name: "character-01" },
  { id: 1, x: "40%", y: "50%", step: 1, origin: 0, name: "character-02" },
  { id: 2, x: "60%", y: "20%", step: 2, origin: 1, name: "character-03" },
  { id: 3, x: "60%", y: "50%", step: 2, origin: 1, name: "character-04" },
  { id: 4, x: "60%", y: "80%", step: 2, origin: 1, name: "character-05" },
  { id: 5, x: "80%", y: "15%", step: 3, origin: 2, name: "character-06" },
  { id: 6, x: "80%", y: "25%", step: 3, origin: 2, name: "character-07" },
  { id: 7, x: "80%", y: "45%", step: 3, origin: 3, name: "character-08" },
  { id: 8, x: "80%", y: "55%", step: 3, origin: 3, name: "character-09" },
  { id: 9, x: "80%", y: "70%", step: 3, origin: 4, name: "character-10" },
  { id: 10, x: "80%", y: "80%", step: 3, origin: 4, name: "character-11" },
  { id: 11, x: "80%", y: "90%", step: 3, origin: 4, name: "character-12" },
];

const spamNodes = [
  { id: 0, x: "20%", y: "50%", step: 0, origin: 0, name: "character-50" },
  { id: 1, x: "40%", y: "20%", step: 1, origin: 0, name: "/animation/headset-1.svg" },
  { id: 2, x: "40%", y: "43.333%", step: 1, origin: 0, name: "/animation/headset-2.svg" },
  { id: 3, x: "40%", y: "66.666%", step: 1, origin: 0, name: "/animation/headset-3.svg" },
  { id: 4, x: "40%", y: "90%", step: 1, origin: 0, name: "/animation/headset-4.svg" },
  { id: 5, x: "60%", y: "20%", step: 2, origin: 1, name: "character-46" },
  { id: 6, x: "60%", y: "43.333%", step: 2, origin: 2, name: "character-15" },
  { id: 7, x: "60%", y: "66.666%", step: 2, origin: 3, name: "character-05" },
  { id: 8, x: "60%", y: "90%", step: 2, origin: 4, name: "character-47" },
  { id: 9, x: "80%", y: "20%", step: 3, origin: 5, name: "/animation/trash.png" },
  { id: 10, x: "80%", y: "43.333%", step: 3, origin: 6, name: "/animation/trash.png" },
  { id: 11, x: "80%", y: "66.666%", step: 3, origin: 7, name: "/animation/trash.png" },
  { id: 12, x: "80%", y: "90%", step: 3, origin: 8, name: "/animation/trash.png" },
];

const App = () => {
  const [slide, setSlide] = useState(0);

  const numSlides = 2;

  function advance() {
    setSlide((slide + 1) % numSlides);
  }

  if (slide === 0) {
    return <GraphAnimation
      key={"slide-0"}
      name="memeSpread"
      nodes={memeSpreadNodes}
      numSteps={4}
      height={550}
      advance={advance}
      scaleByStep={true}
      initialSize={60}
      />
  }
  if (slide === 1) {
    return <GraphAnimation
      key={"slide-1"}
      name="spam"
      nodes={spamNodes}
      numSteps={4}
      height={600}
      advance={advance}
      scaleByStep={false}
      memeUrl="/animation/spam.svg"
    />
  }

  return null;

};

export default App;
