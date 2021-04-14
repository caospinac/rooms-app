import React, { useEffect, useRef } from 'react'
import styles from './Video.module.css'

import PropTypes from 'prop-types'


function Video({ stream, isOwn = false }) {
  const video = useRef()

  useEffect(() => {
    if (stream && video.current && !video.current.srcObject) {
      video.current.srcObject = stream
    }
  }, [stream])

  const handleCanPlay = () => {
    video.current.play()
  }

  return (
    <video ref={video} onCanPlay={handleCanPlay} className={styles.video} muted={isOwn}></video>
  )
}

Video.propTypes = {
  stream: PropTypes.object,
  isOwn: PropTypes.bool,
}

export default Video