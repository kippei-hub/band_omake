import { useState } from "react"

type Props = {
  onUnlock: () => void
}

const PASSWORD = "morensoji"

export function PasswordGate({ onUnlock }: Props) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password === PASSWORD) {
      sessionStorage.setItem("memory-space-unlocked", "true")
      onUnlock()
      return
    }
    setError(true)
    setPassword("")
  }

  return (
    <main className="password-shell">
      <form className="password-panel" onSubmit={submit}>
        <label className="field-label">
          password
          <input
            className="text-input"
            autoFocus
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setError(false)
            }}
          />
        </label>
        <button className="mini-button" type="submit">
          enter
        </button>
        {error && <div className="password-error">denied</div>}
      </form>
    </main>
  )
}
