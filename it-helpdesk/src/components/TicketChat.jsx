import { useState, useEffect, useRef } from 'react'
import { getTicketComments, postTicketComment } from '../api/helpdeskApi'
import { formatDate } from '../utils/dateUtils'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export default function TicketChat({ ticket, authorType, authorId, authorName }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const ticketRowId = ticket?.id

  useEffect(() => {
    if (!ticketRowId) return
    let cancelled = false
    setLoading(true)
    setError('')
    getTicketComments(ticketRowId)
      .then((data) => { if (!cancelled) setComments(data || []) })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load messages') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [ticketRowId])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [comments])

  async function handleSend(e) {
    e.preventDefault()
    const text = message.trim()
    if (!text || !ticketRowId || sending) return
    setSending(true)
    setError('')
    try {
      const created = await postTicketComment(ticketRowId, { authorType, authorId, authorName, message: text })
      setComments((prev) => [...prev, created])
      setMessage('')
      inputRef.current?.focus()
    } catch (err) {
      setError(err.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend(e)
  }

  return (
    <div className="chat-wrap">

      {/* Message list */}
      <div className="chat-messages" ref={listRef}>
        {loading ? (
          <div className="chat-empty">
            <span className="chat-dot" /><span className="chat-dot" /><span className="chat-dot" />
          </div>
        ) : comments.length === 0 ? (
          <div className="chat-empty">
            <ChatIcon />
            <p>No messages yet</p>
            <span>Start the conversation below</span>
          </div>
        ) : (
          comments.map((c) => {
            const isMine = (c.authorId || '').toUpperCase() === (authorId || '').toUpperCase()
            const ini    = getInitials(c.authorName)
            const role   = c.authorType === 'agent' ? 'Agent' : 'Employee'
            return (
              <div key={c.id} className={`chat-row ${isMine ? 'chat-row--mine' : 'chat-row--theirs'}`}>
                <div className={`chat-av chat-av--${c.authorType}`}>{ini}</div>
                <div className="chat-col">
                  {!isMine && (
                    <span className="chat-sender">{c.authorName} <em>{role}</em></span>
                  )}
                  <div className={`chat-bubble ${isMine ? 'chat-bubble--mine' : 'chat-bubble--theirs'}`}>
                    {c.message}
                  </div>
                  <span className="chat-time">{formatDate(c.createdAt)}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Error banner */}
      {error && <div className="chat-err">{error}</div>}

      {/* Compose */}
      <form className="chat-form" onSubmit={handleSend}>
        <textarea
          ref={inputRef}
          className="chat-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write a message… (Ctrl+Enter to send)"
          rows={2}
          disabled={sending}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={sending || !message.trim()}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  )
}
