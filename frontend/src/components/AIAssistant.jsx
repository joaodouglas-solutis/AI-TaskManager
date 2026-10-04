function AIAssistant() {
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
                    ● online
                </span>
            </div>

            <p className="ai-message">
                Você tem 3 tarefas hoje. A mais
                importante parece ser finalizar a API.
            </p>

            <button className="ai-button">
                Conversar com a IA
                <span>→</span>
            </button>
        </div>
    );
}

export default AIAssistant;