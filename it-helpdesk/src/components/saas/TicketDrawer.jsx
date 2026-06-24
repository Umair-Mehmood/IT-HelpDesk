import { useEffect } from 'react'
import { StatusBadge } from '../ui/Primitives'
import TicketChat from '../TicketChat'
import { formatDate } from '../../utils/dateUtils'

export default function TicketDrawer({
  ticket,
  open,
  onClose,
  children,
  chatProps,
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKey)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!ticket) return null

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose} role="presentation" />
      <aside className={`ticket-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="ticket-drawer__header">
          <div>
            <span className="ticket-drawer__id">{ticket.ticketId}</span>
            <h2 className="ticket-drawer__title">{ticket.title}</h2>
          </div>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="ticket-drawer__meta">
          <StatusBadge status={ticket.status} />
          <StatusBadge priority={ticket.priority} />
          <span className="meta-text">{ticket.category}</span>
        </div>

        <div className="ticket-drawer__body">
          <section className="drawer-section">
            <h4 className="section-label">Details</h4>
            <p className="drawer-description">{ticket.description || 'No description provided.'}</p>
            <dl className="detail-grid">
              <div><dt>Employee</dt><dd>{ticket.employeeName}</dd></div>
              <div><dt>Agent</dt><dd>{ticket.agentName || '—'}</dd></div>
              <div><dt>Created</dt><dd>{formatDate(ticket.createdAt)}</dd></div>
              <div><dt>Updated</dt><dd>{formatDate(ticket.updatedAt)}</dd></div>
              {ticket.resolvedAt && <div><dt>Resolved</dt><dd>{formatDate(ticket.resolvedAt)}</dd></div>}
            </dl>
          </section>

          {ticket.resolutionNote && (
            <section className="drawer-section">
              <h4 className="section-label">Resolution</h4>
              <p className="drawer-description">{ticket.resolutionNote}</p>
            </section>
          )}

          {children}

          {chatProps && (
            <section className="drawer-section drawer-section--chat">
              <h4 className="section-label">Conversation</h4>
              <TicketChat {...chatProps} ticket={ticket} defaultOpen />
            </section>
          )}

          <section className="drawer-section">
            <h4 className="section-label">Attachments</h4>
            <div className="attachment-placeholder">
              <span>No attachments</span>
              <button type="button" className="btn btn--ghost btn--sm" disabled>Upload file</button>
            </div>
          </section>
        </div>
      </aside>
    </>
  )
}
