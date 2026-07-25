import { useEffect, useState } from 'react'
import { getDismissedVersion, setDismissedVersion } from '../lib/storage'
import { checkForUpdate } from '../lib/update'

export function useAppUpdate() {
  const [update, setUpdate] = useState(null)

  useEffect(() => {
    checkForUpdate().then((info) => {
      if (info && info.version !== getDismissedVersion()) setUpdate(info)
    })
  }, [])

  function dismissUpdate() {
    if (update) setDismissedVersion(update.version)
    setUpdate(null)
  }

  return { update, dismissUpdate }
}
