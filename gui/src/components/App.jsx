import React, { useEffect, useMemo, useState } from 'react'
import useUserMedia from '../hooks/userMedia'
import socketIOClient from 'socket.io-client'
import styles from './App.module.css'
import Peer from 'peerjs'
import Video from './Video'

const id = 'room'

function Room() {
  const [stream, loadingMedia, errorMedia] = useUserMedia()
  const [myUserId, setMyUserId] = useState()
  const [videos, setVideos] = useState({})
  const [videoList, setVideoList] = useState({})
  const [peers, setPeers] = useState({})

  const peer = useMemo(() => {
    return new Peer(undefined, {
      host: '/',
      path: '/peer',
      port: 80,
    })
  }, [])

  const socket = useMemo(() => {
    return socketIOClient({
      path: '/web/socket.io'
    })
  }, [])

  const addVideoStream = (userId, videoStream) => {
    setVideos(prev => ({ ...prev, [userId]: videoStream }))
  }

  const removeVideoStream = (userId) => {
    setVideos(({ [userId]: _, ...rest }) => rest)
  }

  useEffect(() => {
    setVideoList(Object.values(videos))
  }, [videos])

  useEffect(() => {
    if (!(peer, socket)) return

    const listener = userId => {
      setMyUserId(userId)
      socket.emit('join-room', id, userId)
    }
    peer.on('open', listener)

    return () => peer.off('open', listener)
  }, [peer, socket])

  useEffect(() => {
    if (!(peer, socket)) return

    const listener = userId => {
      if (peers[userId]) {
        peers[userId].close()
      }
    }
    socket.on('user-disconnected', listener)

    return () => socket.off('user-disconnected', listener)
  }, [peer, socket, peers])

  useEffect(() => {
    if (!(stream, myUserId, peer)) return

    const listener = call => {
      call.answer(stream)
      call.on('stream', videoStream => {
        addVideoStream(myUserId, videoStream)
      })
    }
    peer.on('call', listener)

    return () => peer.off('call', listener)
  }, [peer, myUserId, stream])

  useEffect(() => {
    if (!(stream, peer, socket)) return

    // Connect to new user
    const listener = userId => {
      const call = peer.call(userId, stream)

      call.on('stream', videoStream => {
        addVideoStream(userId, videoStream)
      })
      call.on('close', () => {
        removeVideoStream(userId)
      })
      setPeers(prev => ({ ...prev, [userId]: call }))
    }

    socket.on('user-connected', listener)

    return () => socket.off('user-connected', listener)

  }, [peer, socket, stream])


  useEffect(() => {
    if (!(stream)) return

    addVideoStream(myUserId, stream)
  }, [stream, myUserId])


  if (loadingMedia || !(peer, socket)) {
    return <></>
  }

  if (errorMedia) {
    console.error(errorMedia)

    return <></>
  }


  return (
    <div className={styles.grid}>
      {videoList.map((v, i) => <Video key={i} stream={v}></Video>)}
    </div>
  )
}

export default Room
