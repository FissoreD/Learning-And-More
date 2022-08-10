import React from "react";
import { setUrlFromPosition } from "../globalFunctions";

interface PropReact { switchSection: ((sectionName: string) => void) }

class HomePage extends React.Component<PropReact, {}> {
  constructor(prop: PropReact) {
    super(prop)
    setUrlFromPosition("", 0)
  }

  render(): React.ReactNode {
    return <div style={{ overflow: "hidden" }}>
      <h1>Learning and More</h1>
      <p>
        This site is conceived to visualized some algorithms from the Theoretical Computer Science.
      </p>
      <h3 >Automata</h3>
      <p>
        The <button onClick={() => this.props.switchSection("Automaton")}>Automaton</button> section aims to represent regular finite state machines and visibly pushdown automata. <br />
        The former can represent regular expressions whereas the latter is a more powerful tool for a subclass of context-free grammars where the intersection of the three alphabets, <i>CALL, INT and RET</i>, gives the empty set. <br />
        In this section you can make some useful operations between automata such as intersection, union, difference, complementation and the result will be displayed in the <i>"normal"</i> form where you can see the cartesian product of the automata and the <i>"minimized"</i> representation below.
      </p>
      <h3>Active learning</h3>
      <p>
        The <button onClick={() => this.props.switchSection("Learning")}>Learning</button> section offers an implemantation of the <i> L*, NL* and TTT</i> learning alogorithms respectively conceived by <i>Dana Angluin, Benedikt Bollig et Al., Malte Isberner et Al</i>. The <i>TTT-VPA</i> algorithm is a variant of <i>TTT</i> and its goal is to understand visibly pushdown languages such as XML. <br />
        The reader should know that the learning framework should be seen as the interaction of a <i>Learner</i> and a <i>Teacher</i>. The first entity has the goal to understand the <i>Teacher</i>'s language <b>U</b> thanks to:
      </p>
      <ul>
        <li><i>Membership queries</i>: it sends a words to the <i>Teacher</i> willing to know if the word belogs to the uknown lnaugage;</li>
        <li><i>Equivalence queries</i>: it sends a conjecture to the <i>Teacher</i> in the form of a finite state machine and will receives in answer either a confirmation if the conjecture correctly represents the unkown language, or a counter-example which is a word belonging to <b>U</b> if and only if it does not belong to the conjecture's language.</li>
      </ul>
      <p>
        The Teacher is called <i>Minimally Adequate</i> if it always returns a counter-example of least length. <br />
        This kind of learning is called <i>Active</i> since the <i>Learner</i> can understand <b>U</b> by activly interacting with the <i>Teacher</i>. On the other hand the <i>Passive Learning</i> is the learning where the learner is provided a set of words belonging to <b>U</b> and from this, the <i>Learner</i> should build the automaton.
      </p>
    </div>
  }
}

export default HomePage