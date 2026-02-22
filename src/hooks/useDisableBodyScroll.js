import { useEffect } from 'react'

export const useDisableBodyScroll = (active) => {
    useEffect(() => {
        if (active) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [active])
}
