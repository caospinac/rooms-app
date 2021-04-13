import React, { useEffect, useMemo, useState } from 'react'
import useUserMedia from '../hooks/userMedia'
import socketIOClient from 'socket.io-client'
import styles from './App.module.css'
import Peer from 'peerjs'
import useMap from '../hooks/map'
// TODO: enable video
// import Video from './Video'

const id = 'room'

function Room() {
  const [stream, loadingMedia, errorMedia] = useUserMedia()
  const [myUserId, setMyUserId] = useState()
  const [videos, setVideo, removeVideo] = useMap()
  const [peers, setPeer] = useMap()

  const peer = useMemo(() => {
    return new Peer(undefined, {
      host: '/',
      path: '/peer',
      port: 80,
    })
  }, [])

  const socket = useMemo(() => {
    return socketIOClient({
      path: '/web/socket.io',
    })
  }, [])

  const addVideoStream = (videoStream) => {
    // const videoId = id || Math.random().toString(36).substring(7)
    // console.log(videoId)
    setVideo(videoStream.id, videoStream)
  }

  const removeVideoStream = (userId) => {
    removeVideo(userId)
  }

  useEffect(() => {
    if (!(peer && socket)) return

    const listener = userId => {
      setMyUserId(userId)
      socket.emit('join-room', id, userId)
    }
    peer.on('open', listener)

    return () => peer.off('open', listener)
  }, [peer, socket])

  useEffect(() => {
    if (!(peer && socket)) return

    const listener = userId => {
      let peer = peers.get(userId)
      if (peer) {
        peer.close()
      }
    }
    socket.on('user-disconnected', listener)

    return () => socket.off('user-disconnected', listener)
  }, [peer, socket, peers])

  useEffect(() => {
    if (!(stream && myUserId && peer)) return

    const listener = call => {
      call.answer(stream)
      call.on('stream', videoStream => {
        addVideoStream(videoStream)
      })
    }
    peer.on('call', listener)

    return () => peer.off('call', listener)
  }, [peer, myUserId, stream])

  useEffect(() => {
    if (!(stream && peer && socket)) return

    // Connect to new user
    // TODO: fix listener
    const listener = userId => {
      const call = peer.call(userId, stream)

      call.on('stream', videoStream => {
        addVideoStream(videoStream)

        call.on('close', () => {
          removeVideoStream(videoStream.id)
        })
      })
      setPeer(userId, call)
    }

    socket.on('user-connected', listener)

    return () => socket.off('user-connected', listener)

  }, [peer, socket, stream])


  useEffect(() => {
    if (!(stream)) return

    addVideoStream(stream)
  }, [stream])


  if (loadingMedia || !(peer && socket)) {
    return <></>
  }

  if (errorMedia) {
    console.error(errorMedia)

    return <></>
  }


  return (
    <div className={styles.grid}>
      {JSON.stringify([...videos.values()])}
      {/* {videosList.map((v, i) => <Video key={i} stream={v}></Video>)} */}
    </div>
  )
}

export default Room
