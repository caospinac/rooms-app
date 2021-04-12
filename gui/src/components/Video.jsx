import { useRef } from "react"
import styles from './Video.module.css'


function Video({ stream, isOwn = false }) {
  const video = useRef()

  if (stream && video.current && !video.current.srcObject) {
    video.current.srcObject = stream;
  }

  const handleCanPlay = () => {
    video.current.play();
  }

  return (
    <video ref={video} onCanPlay={handleCanPlay} className={styles.video} muted={isOwn}></video>
  )
}

export default Video
