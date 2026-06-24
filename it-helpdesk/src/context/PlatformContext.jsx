import { createContext, useContext } from 'react'

const PlatformContext = createContext({
  role: null,
  user: null,
  breadcrumbs: [],
  searchItems: [],
  onSearchSelect: null,
})

export function PlatformProvider({ children, value }) {
  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
}

export function usePlatform() {
  return useContext(PlatformContext)
}
