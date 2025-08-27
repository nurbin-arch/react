import { useCallback, useEffect, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  }, [key, initialValue])

  const [storedValue, setStoredValue] = useState(readValue)

  useEffect(() => {
    setStoredValue(readValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const setValue = useCallback(
    value => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch {
        // ignore
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}


