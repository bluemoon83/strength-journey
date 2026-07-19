import React, { useEffect } from 'react'
import { ExternalLink, Play, X } from 'lucide-react'

function youtubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
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

  const demoUrl = youtubeSearchUrl(demoQuery || `${exerciseName} exercise demonstration`)

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

        <div className="demoUnavailableCard">
          <div className="demoUnavailableIcon"><Play size={34} fill="currentColor"/></div>
          <h3>Open the exercise demonstration</h3>
          <p>
            YouTube no longer supports the search-based embedded player used in the previous release.
            Open the results in YouTube to choose a clear demonstration.
          </p>
          <a className="demoExternalButton" href={demoUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={18}/> Open demo on YouTube
          </a>
        </div>

        <p className="demoHint">Your workout remains saved while the demonstration opens in a new tab.</p>
      </section>
    </div>
  )
}
