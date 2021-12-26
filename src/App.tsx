import ProgramTables from './components/ProgramTables';
import Editor from './components/Editor';
import "./App.scss";
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { haltSelector, step, resetHalt } from './reducers/memoryReducer';
import NavBar from './components/nav/Header';

const DEFAULT_SPEED = 20;
const App = () => {
  const dispatch = useAppDispatch();
  const [running, setRunning] = useState(false);
  const [disableAssemble, setDisableAssemble] = useState(false);
  const runSpeed = useRef<number>(DEFAULT_SPEED);
  const editorRef = useRef<any>();
  const runIntervalId = useRef<any>(null);
  const halt = useAppSelector(haltSelector);

  useEffect(() => {
    if (halt && runIntervalId.current) clearInterval(runIntervalId.current);
  }, [halt]);


  /**
   * Sets up interval to step through
   * each loaded instruction
   */
  const SLOW = 1000;
  const FAST = 50;
  const handleRun = () => {
    const wasRunning = running;

    setRunning(!running);

    if (wasRunning) {
      clearInterval(runIntervalId.current);
      runIntervalId.current = null;
      return;
    }

    dispatch(resetHalt());

    // Range slow (1000) to fast (50)
    const speed = SLOW - (runSpeed.current / 100) * (SLOW - FAST);
    runIntervalId.current = setInterval(() => {
       dispatch(step())
    }, speed); // 500 should be bound to slider
  }

  const handleRunSpeed = (value: number) => runSpeed.current = value;

  return (
    <div className="body-wrapper">
      <NavBar 
        handleAssemble={(base: number, reset: boolean = false) => editorRef.current && editorRef.current.generateMachineCode(base, reset)}
        handleLoadBinary={(base: number, reset: boolean = false) => editorRef.current && editorRef.current.loadBinary(base, reset)}
        disabledAssemble={disableAssemble}
        handleStep={() => dispatch(step())}
        handleRun={() => handleRun()}
        handleRunSpeed={(newSpeed: number) => handleRunSpeed(newSpeed)}
        running={running}
      />

      <div className="app-wrapper">
          <div className="editor">   
            <Editor ref={editorRef} setDisableAssemble={setDisableAssemble}/>
          </div>
          <div className="program-tables">
            <ProgramTables />
          </div>
      </div>
    </div>
  );
}

export default App;
