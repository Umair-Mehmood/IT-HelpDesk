import { useState, useEffect, useRef } from 'react'
import { getTicketComments, postTicketComment } from '../api/helpdeskApi'
import { formatDate } from '../utils/dateUtils'

export default function TicketChat({ ticket, authorType, authorId, authorName }) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const listRef = useRef(null)

  const ticketRowId = ticket?.id

  useEffect(() => {
    if (!open || !ticketRowId) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getTicketComments(ticketRowId)
        if (!cancelled) setComments(data || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load messages')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [open, ticketRowId])

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [open, comments])

  async function handleSend(e) {
    e.preventDefault()
    const text = message.trim()
    if (!text || !ticketRowId) return
    setSending(true)
    setError('')
    try {
      const created = await postTicketComment(ticketRowId, {
        authorType,
        authorId,
        authorName,
        message: text,
      })
      setComments((prev) => [...prev, created])
      setMessage('')
    } catch (err) {
      setError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="ticket-chat">
      <button
        type="button"
        className="ticket-chat-toggle secondary"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? 'Hide conversation' : 'View conversation'}
        {comments.length > 0 && !open && (
          <span className="ticket-chat-count">{comments.length}</span>
        )}
      </button>

      {open && (
        <div className="ticket-chat-panel">
          <div className="ticket-chat-messages" ref={listRef}>
            {loading ? (
              <p className="ticket-chat-empty">Loading messages…</p>
            ) : comments.length === 0 ? (
              <p className="ticket-chat-empty">No messages yet. Start the conversation below.</p>
            ) : (
              comments.map((c) => {
                const isMine = (c.authorId || '').toUpperCase() === (authorId || '').toUpperCase()
                return (
                  <div
                    key={c.id}
                    className={`ticket-chat-bubble ${c.authorType} ${isMine ? 'mine' : 'theirs'}`}
                  >
                    <div className="ticket-chat-bubble-meta">
                      <strong>{c.authorName}</strong>
                      <span>{c.authorType === 'agent' ? 'Agent' : 'Employee'}</span>
                      <span>{formatDate(c.createdAt)}</span>
                    </div>
                    <p>{c.message}</p>
                  </div>
                )
              })
            )}
          </div>

          {error && <p className="ticket-chat-error">{error}</p>}

          <form className="ticket-chat-form" onSubmit={handleSend}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message…"
              rows={2}
              disabled={sending}
            />
            <button type="submit" className="primary" disabled={sending || !message.trim()}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
