function Header({
                    theme,
                    toggleTheme,
                    searchQuery,
                    onSearchChange
                }) {
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
                <span>
                    ⌕
                </span>

                <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) =>
                        onSearchChange(
                            event.target.value
                        )
                    }
                    placeholder="Buscar tarefas..."
                    aria-label="Buscar tarefas"
                />

                {searchQuery && (
                    <button
                        type="button"
                        className="search-clear"
                        onClick={() =>
                            onSearchChange("")
                        }
                        aria-label="Limpar busca"
                        title="Limpar busca"
                    >
                        ×
                    </button>
                )}

                {!searchQuery && (
                    <kbd>
                        Ctrl K
                    </kbd>
                )}
            </div>

            <div className="header-actions">
                <button
                    className="theme-toggle"
                    type="button"
                    onClick={toggleTheme}
                    aria-label="Alternar tema"
                >
                    {theme === "light"
                        ? "☾"
                        : "☀"}
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