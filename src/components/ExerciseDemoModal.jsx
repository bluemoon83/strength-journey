import React, { useEffect } from 'react'
import { Play, X } from 'lucide-react'

function youtubeEmbedUrl(query) {
  const encoded = encodeURIComponent(query)
  return `https://www.youtube-nocookie.com/embed?listType=search&list=${encoded}&autoplay=1&rel=0`
}

export default function ExerciseDemoModal({ exerciseName, demoQuery, onClose }) {
  useEffect(() => {
    const closeOnEscape = event => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.classList.add('demoModalOpen')
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.classList.remove('demoModalOpen')
    }
  }, [onClose])

  return (
    <div className="demoBackdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="demoModal"
        role="dialog"
        aria-modal="true"
        aria-label={`${exerciseName} demonstration`}
        onMouseDown={event => event.stopPropagation()}
      >
        <header className="demoHeader">
          <div>
            <span className="demoEyebrow"><Play size={14}/> Quick demo</span>
            <h2>{exerciseName}</h2>
          </div>
          <button className="demoClose" type="button" onClick={onClose} aria-label="Close demo">
            <X size={22}/>
          </button>
        </header>

        <div className="demoVideo">
          <iframe
            src={youtubeEmbedUrl(demoQuery)}
            title={`${exerciseName} quick demonstration`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>

        <p className="demoHint">Watch the first clear demonstration, then close this window to return to your workout.</p>
      </section>
    </div>
  )
}
