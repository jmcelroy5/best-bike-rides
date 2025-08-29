import { useState } from 'react'
import type { JSX } from 'react'

function UploadForm(): JSX.Element {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [gpxFile, setGpxFile] = useState<File | null>(null)
    const [status, setStatus] = useState<string | null>(null)
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!gpxFile) {
        setStatus('Please select a GPX file.')
        return
      }
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('gpxFile', gpxFile)
      try {
        const res = await fetch('/api/bike-routes', {
          method: 'POST',
          body: formData,
        })
        if (res.ok) {
          setStatus('Route uploaded successfully!')
          setName('')
          setDescription('')
          setGpxFile(null)
        } else {
          const data = await res.json()
          setStatus(data.error || 'Upload failed.')
        }
      } catch (err) {
        setStatus('Network error.')
      }
    }
  
    return (
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2>Upload New Bike Route</h2>
        <label>
          Name
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea value={description} onChange={e => setDescription(e.target.value)} />
        </label>
        <label>
          GPX File
          <input type="file" accept=".gpx" onChange={e => setGpxFile(e.target.files?.[0] || null)} required />
        </label>
        <button type="submit">Upload</button>
        {status && <div>{status}</div>}
      </form>
    )
  }

  export default UploadForm;