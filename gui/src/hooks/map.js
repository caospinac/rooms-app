import { useState } from 'react'

const useMap = () => {
  const [values, setValues] = useState(() => new Map())

  const setter = (key, value) => {
    setValues(prev => new Map([...prev, [key, value]]))
  }

  const remove = (key) => {
    setValues(prev => {
      const map = new Map([...prev])
      map.delete(key)

      return map
    })
  }

  return [values, setter, remove]
}

export default useMap
