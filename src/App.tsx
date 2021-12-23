import ProgramTables from './components/ProgramTables';
import Editor from './components/Editor';
import "./App.scss";
import { useRef, useState } from 'react';
import { useAppDispatch } from './store';
import { step } from './reducers/memoryReducer';
import NavBar from './components/nav/Header';

const App = () => {
  const dispatch = useAppDispatch();
  const editorRef = useRef<any>();
  const [running, setRunning] = useState(false);

  const runIntervalId = useRef<any>(null);
  const handleRun = () => {
    const wasRunning = running;

    setRunning(!running);

    console.log(wasRunning)
    if (wasRunning) {
      clearInterval(runIntervalId.current);
      runIntervalId.current = null;
      return;
    }

    runIntervalId.current = setInterval(() => dispatch(step()), 500); // 500 should be bound to slider
  }

  return (
    <div className="body-wrapper">
      <NavBar 
        handleAssemble={() => editorRef.current && editorRef.current.generateMachineCode()}
        handleLoadBinary={() => editorRef.current && editorRef.current.loadBinary()}
        handleStep={() => dispatch(step())}
        handleRun={() => handleRun()}
        running={running}
      />

      <div className="app-wrapper">
          <div className="editor">   
            <Editor ref={editorRef}/>
          </div>
          <div className="program-tables">
            <ProgramTables />
          </div>
      </div>
    </div>
  );
}

export default App;
