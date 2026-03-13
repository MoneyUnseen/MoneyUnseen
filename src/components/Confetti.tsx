import { useEffect } from 'react'

interface ConfettiProps {
  show: boolean
  onComplete?: () => void
}

export default function Confetti({ show, onComplete }: ConfettiProps) {
  useEffect(() => {
    if (!show) return

    const confettiCount = 50
    const container = document.body

    const confettiElements: HTMLDivElement[] = []

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div')
      confetti.className = 'confetti'
      confetti.style.left = Math.random() * 100 + '%'
      confetti.style.animationDelay = Math.random() * 0.5 + 's'
      confetti.style.animationDuration = 2 + Math.random() * 2 + 's'
      container.appendChild(confetti)
      confettiElements.push(confetti)
    }

    const timeout = setTimeout(() => {
      confettiElements.forEach(el => el.remove())
      if (onComplete) onComplete()
    }, 4000)

    return () => {
      clearTimeout(timeout)
      confettiElements.forEach(el => el.remove())
    }
  }, [show, onComplete])

  return null
}
