function AIAssistant({
                         summary,
                         focusTask,
                         isLoading,
                         error,
                         onRefresh,
                         onOpenTask
                     }) {
    const handleOpenTask = () => {
        if (!focusTask || !onOpenTask) {
            return;
        }

        onOpenTask(focusTask);
    };

    return (
        <div className="ai-panel panel">
            <div className="ai-heading">
                <div>
                    <span className="eyebrow">
                        ASSISTENTE
                    </span>

                    <h2>
                        Uma segunda cabeça.
                    </h2>
                </div>

                <span className="ai-status">
                    {isLoading
                        ? "● pensando"
                        : error
                            ? "● indisponível"
                            : "● online"}
                </span>
            </div>

            {isLoading && (
                <p className="ai-message">
                    Estou lendo seu workspace...
                </p>
            )}

            {!isLoading && error && (
                <p className="ai-message">
                    Não consegui analisar seu workspace agora.
                </p>
            )}

            {!isLoading &&
                !error &&
                summary && (
                    <>
                        <p className="ai-message">
                            {summary}
                        </p>

                        {focusTask && (
                            <div
                                style={{
                                    marginTop:
                                        "24px",
                                    padding:
                                        "14px 16px",
                                    background:
                                        "rgba(255, 255, 255, 0.08)",
                                    border:
                                        "1px solid rgba(255, 255, 255, 0.16)",
                                    borderRadius:
                                        "12px"
                                }}
                            >
                                <span
                                    style={{
                                        display:
                                            "block",
                                        marginBottom:
                                            "5px",
                                        color:
                                            "#dbe7c4",
                                        fontSize:
                                            "9px",
                                        fontWeight:
                                            "800",
                                        letterSpacing:
                                            "0.1em"
                                    }}
                                >
                                    FOCO SUGERIDO
                                </span>

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        marginBottom:
                                            "10px",
                                        fontSize:
                                            "14px"
                                    }}
                                >
                                    {
                                        focusTask.title
                                    }
                                </strong>

                                <span
                                    style={{
                                        display:
                                            "block",
                                        marginBottom:
                                            "12px",
                                        color:
                                            "rgba(245, 246, 239, 0.72)",
                                        fontSize:
                                            "11px",
                                        lineHeight:
                                            "1.45"
                                    }}
                                >
                                    {
                                        summary.focusReason
                                    }
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        handleOpenTask
                                    }
                                    style={{
                                        padding:
                                            "8px 11px",
                                        background:
                                            "transparent",
                                        border:
                                            "1px solid rgba(255, 255, 255, 0.25)",
                                        borderRadius:
                                            "8px",
                                        color:
                                            "#f5f6ef",
                                        fontSize:
                                            "11px",
                                        fontWeight:
                                            "700",
                                        cursor:
                                            "pointer"
                                    }}
                                >
                                    Abrir tarefa →
                                </button>
                            </div>
                        )}
                    </>
                )}

            <button
                className="ai-button"
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
            >
                {isLoading
                    ? "Analisando..."
                    : "Atualizar leitura"}
                <span>
                    ↻
                </span>
            </button>
        </div>
    );
}

export default AIAssistant;