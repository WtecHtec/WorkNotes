import React from 'react';
import { Link } from 'react-router-dom'
import styles from './index.css';
const Home = () => {
  console.log('styles====', styles.wrapper)
  return (
    <div className={styles.wrapper}>
      <div className={styles.title} onClick={() => alert('Home click')}>
        Home, This is wbh's ssr demo
      </div>
      <Link to='/text'>跳转到 text</Link>
    </div>
  )
}
export default Home