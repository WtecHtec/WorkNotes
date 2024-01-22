import { useState, useEffect } from 'react'
import { record,  } from 'rrweb'
import './App.css'
import { eventDatas } from './data'
import Replayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import viteLogo from '/vite.svg'
function App() {
  const [count, setCount] = useState(0)
  let events = [];

  useEffect(() => {
    record({
      emit(event) {
        console.log(event)
        // 将 event 存入 events 数组中
        events.push(event);
      },
    });
    return () => {
      console.log('events===')
    }
  })

  const handlePlay = () => {
    console.log('eventDatas===', eventDatas.length)
    const replayer = new Replayer({
      target: document.body, // 可以自定义 DOM 元素
      // 配置项
      props: {
        events: eventDatas,
      },
    });

    // 播放
    replayer.play();
  }
  return (
    <>
     <img src="https://img-blog.csdnimg.cn/20201014180756926.png?x-oss-process=image/resize,m_fixed,h_64,w_64" className="logo" alt="Vite logo" />
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={() => console.log(JSON.stringify(events))}>
          Events
        </button>
        <button onClick={() => handlePlay()}>
          Player
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
