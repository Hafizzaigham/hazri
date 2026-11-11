import { createContext, useContext } from 'react'

const NavContext = createContext(null)

export function NavProvider({ value, children }) {
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export function useNav() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('Navigation is missing')
  return ctx
}
