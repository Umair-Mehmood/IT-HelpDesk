import { createContext, useCallback, useContext, useState } from 'react'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)

  const confirm = useCallback(
    ({ title, message, confirmLabel = 'Confirm', danger = false }) =>
      new Promise((resolve) => {
        setState({ title, message, confirmLabel, danger, resolve })
      }),
    []
  )

  function close(result) {
    state?.resolve(result)
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="modal-backdrop" onClick={() => close(false)} role="presentation">
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3 className="modal__title">{state.title}</h3>
            <p className="modal__body">{state.message}</p>
            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => close(false)}>Cancel</button>
              <button
                type="button"
                className={`btn ${state.danger ? 'btn--danger' : 'btn--primary'}`}
                onClick={() => close(true)}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
