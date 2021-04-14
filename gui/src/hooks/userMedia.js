import { useEffect, useState } from 'react'

const useUserMedia = () => {
  const [stream, setStream] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!stream) {
      navigator.mediaDevices.getUserMedia = navigator.mediaDevices?.getUserMedia ||
                                            navigator.getUserMedia ||
                                            navigator.webkitGetUserMedia ||
                                            navigator.mozGetUserMedia

      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(r => setStream(r))
        .catch(e => setError(e))
        .finally(() => setLoading(false))
    } else {
      return () => {
        stream.getTracks().forEach(track => {
          track.stop()
        })
      }
    }
  }, [stream])

  return [stream, loading, error]
}

export default useUserMedia
