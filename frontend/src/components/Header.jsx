function Header({ theme, toggleTheme }) {
    return (
        <header className="topbar">
            <div className="brand">
                <span className="brand-mark">
                    T
                </span>

                <span>
                    TASKFLOW
                </span>
            </div>

            <div className="search">
                <span>⌕</span>

                <input
                    type="text"
                    placeholder="Buscar tarefas..."
                />

                <kbd>
                    ⌘ K
                </kbd>
            </div>

            <div className="header-actions">
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label="Alternar tema"
                >
                    {theme === "light" ? "☾" : "☀"}
                </button>

                <div className="profile">
                    <div className="avatar">
                        D
                    </div>

                    <span>
                        Douglas
                    </span>
                </div>
            </div>
        </header>
    );
}

export default Header;