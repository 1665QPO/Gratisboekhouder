import { NavLink, Outlet } from 'react-router-dom'
import { GITHUB_REPO_URL } from '../lib/links'

const NAV_ITEMS = [
  { to: '/import', label: 'Importeren' },
  { to: '/transacties', label: 'Transacties' },
  { to: '/bonnetjes', label: 'Bonnetjes' },
  { to: '/aangifte', label: 'Aangifte-overzicht' },
]

function navLinkClasses({ isActive }: { isActive: boolean }): string {
  return `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-accent-600 text-white'
      : 'text-stone-600 hover:bg-accent-50 hover:text-accent-800'
  }`
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <NavLink to="/" className="flex items-center gap-2 text-lg font-semibold text-stone-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-600 leading-none text-white">
              €
            </span>
            Gratis Boekhouder
          </NavLink>
          <nav className="flex flex-wrap gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClasses}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-stone-500">
          <div className="flex flex-wrap gap-4">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-stone-700 hover:underline"
            >
              🔓 Gratis & open source op GitHub
            </a>
            <span>🔒 100% privé: alles blijft op jouw apparaat</span>
          </div>
          <NavLink to="/privacy" className="underline hover:text-stone-700">
            Hoe werkt dat precies?
          </NavLink>
        </div>
      </footer>
    </div>
  )
}
