# Learning and More

This project provides an implementation of some algorithms of Black Box learning.  
Inspired on Dana Angluin's learning framework, theoretical computer scientist have developed some strategies aiming to learn unknown regular languages.  
The first algorithm, the L*, created by Mrs. Angluin in 1987 is the precursor of this branch of computer science.

The logic behind this kind of learning is that a *learner* **L** is willing to learn an unknown language *U* and can communicate with a *teacher* **T** who knows *U*.  
Two kind of interactions are allowed : 
- Membership queries : **L** sends to **T** a word *w* and **T** answers if *w* belongs to *U*
- Equivalence queries : **L** sends to **T** a conjecture on the form of an automaton *A* to **T**. Let *A'* be the symmetric difference between *L(A)* and *L(U)*. Then the teacher accepts the conjecture if *L(A') =* $\varnothing$ or provides a counter-example, that is a word belonging to *L(A')*, note that such a word is a word that is accepted by *L(A)* and rejected by *L(U)* or vice versa. It should be noted that the learning phase stops only when **T** accepts a conjecture: **L** has learned the **U**.

This *learner-teacher* framework has been reused to create a lot of algorithms ([This page](https://wcventure.github.io/Active-Automata-Learning/#31-angluins-l-algorithm-pdfhttpspeopleeecsberkeleyedudawnsongteachings10papersangluin87pdf) lists a lot of the existing Active Learning algorithms).

During my internship at the *i3s* I have studied and implemented some of them. They are available [here](https://fissored.github.io/Learning-And-More?Home). In particular, the available algorithms are:
- L*, by Dana Angluin
- NL*, by Bollig et al.
- TTT (called TTT-DFA), by Isberner et al.
- TTT-VPA, by Isberner et al.

The first three algorithms learn *regular languages* and, therefore, at the end, return *regular automata*. It should be noted that L* and NL* use the *Observation Table* data structure to store the knowledge obtained through the interactions *learner-teacher* whereas the *TTT-DFA* and *TTT-VPA* use the *Discrimination Tree* data structure.

An other difference between these algorithms is that :
- L* and TTT-DFA returns at the end *minimal deterministic regular automata*;
- NL* returns canonical residual final state automata (which are non-deterministic automata, potentially smaller than the corresponding minimal DFA)
- TTT-VPA returns a *1-SEVPA* which is a one single entry visible pushdown automata able to learn visible pushdown grammars.

One can therefore see that the *TTT-VPA* algorithms is the most powerful, since it can be used to understand more powerful grammars than regular ones (see [here](https://en.wikipedia.org/wiki/Chomsky_hierarchy)).

# My implementation
The implementation that I realized, aims to provide an easy way to correctly display each step of each algorithm graphically thanks *html tables* and the *[graphviz](https://graphviz.org/)* library, useful to represents automata and binary tree.  
The project is done entirely in *typescript* and compiled with *nodejs*. 

The source files are divided into two main folders : 
- lib : contains all files related to the learning algorithms and are tested through unit tests.
- reactjs : contains all files that are supposed to manage the *html* web page, to do that I use [ReactJS](https://reactjs.org/), [Redux](https://redux.js.org/) and [Bootstrap v5.0](https://getbootstrap.com/docs/5.0/getting-started/introduction/). 


---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
