import {
    useState
} from "react";

import taskService from "../services/taskService";

const SUGGESTIONS = [
    "Quais são minhas tarefas de alta prioridade?",
    "Qual tarefa eu deveria fazer primeiro?",
    "Tenho tarefas atrasadas?"
];

function AIAssistant({
                         summary,
                         focusTask,
                         isLoading,
                         error,
                         onRefresh,
                         onOpenTask
                     }) {

    const [
        isChatOpen,
        setIsChatOpen
    ] = useState(false);

    const [
        messages,
        setMessages
    ] = useState([]);

    const [
        input,
        setInput
    ] = useState("");

    const [
        isSending,
        setIsSending
    ] = useState(false);

    const [
        chatError,
        setChatError
    ] = useState("");

    const handleOpenTask = () => {
        if (!focusTask || !onOpenTask) {
            return;
        }

        onOpenTask(focusTask);
    };

    const handleOpenChat = () => {
        setIsChatOpen(true);
        setChatError("");
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
        setChatError("");
    };

    const handleSendMessage =
        async (message) => {

            const trimmedMessage =
                message.trim();

            if (
                !trimmedMessage ||
                isSending
            ) {
                return;
            }

            const history =
                messages.map(
                    (item) => ({
                        role:
                        item.role,
                        content:
                        item.content
                    })
                );

            const userMessage = {
                role: "user",
                content:
                trimmedMessage
            };

            setMessages(
                (currentMessages) => [
                    ...currentMessages,
                    userMessage
                ]
            );

            setInput("");
            setChatError("");
            setIsSending(true);

            try {
                const response =
                    await taskService.chat(
                        trimmedMessage,
                        history
                    );

                setMessages(
                    (currentMessages) => [
                        ...currentMessages,
                        {
                            role:
                                "assistant",
                            content:
                            response.answer
                        }
                    ]
                );

            } catch (requestError) {
                setChatError(
                    requestError.message ||
                    "Não consegui responder agora."
                );
            } finally {
                setIsSending(false);
            }
        };

    const handleSubmit =
        async (event) => {
            event.preventDefault();

            await handleSendMessage(
                input
            );
        };

    const handleInputKeyDown =
        async (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {
                event.preventDefault();

                await handleSendMessage(
                    input
                );
            }
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
                    {isSending
                        ? "● pensando"
                        : isLoading
                            ? "● analisando"
                            : error
                                ? "● indisponível"
                                : "● online"}
                </span>
            </div>

            {!isChatOpen && (
                <>
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
                                                    "12px",
                                                fontSize:
                                                    "14px"
                                            }}
                                        >
                                            {
                                                focusTask.title
                                            }
                                        </strong>

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

                    <div
                        style={{
                            display:
                                "flex",
                            gap:
                                "8px",
                            marginTop:
                                "auto"
                        }}
                    >
                        <button
                            className="ai-button"
                            type="button"
                            onClick={
                                handleOpenChat
                            }
                        >
                            Conversar com a IA
                            <span>
                                →
                            </span>
                        </button>

                        <button
                            className="ai-button"
                            type="button"
                            onClick={
                                onRefresh
                            }
                            disabled={
                                isLoading
                            }
                            style={{
                                background:
                                    "transparent",
                                border:
                                    "1px solid rgba(255, 255, 255, 0.25)",
                                color:
                                    "#f5f6ef"
                            }}
                        >
                            {isLoading
                                ? "Analisando..."
                                : "Atualizar"}
                            <span>
                                ↻
                            </span>
                        </button>
                    </div>
                </>
            )}

            {isChatOpen && (
                <div
                    style={{
                        display:
                            "flex",
                        flexDirection:
                            "column",
                        flex:
                            "1",
                        minHeight:
                            "0",
                        marginTop:
                            "24px"
                    }}
                >
                    <div
                        style={{
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "space-between",
                            marginBottom:
                                "14px"
                        }}
                    >
                        <span
                            style={{
                                color:
                                    "rgba(245, 246, 239, 0.7)",
                                fontSize:
                                    "11px"
                            }}
                        >
                            Pergunte sobre suas tarefas.
                        </span>

                        <button
                            type="button"
                            onClick={
                                handleCloseChat
                            }
                            style={{
                                padding:
                                    "6px 9px",
                                background:
                                    "transparent",
                                border:
                                    "1px solid rgba(255, 255, 255, 0.2)",
                                borderRadius:
                                    "7px",
                                color:
                                    "#f5f6ef",
                                fontSize:
                                    "10px",
                                fontWeight:
                                    "700",
                                cursor:
                                    "pointer"
                            }}
                        >
                            Resumo
                        </button>
                    </div>

                    <div
                        style={{
                            flex:
                                "1",
                            minHeight:
                                "170px",
                            maxHeight:
                                "260px",
                            display:
                                "flex",
                            flexDirection:
                                "column",
                            gap:
                                "9px",
                            paddingRight:
                                "4px",
                            overflowY:
                                "auto"
                        }}
                    >
                        {messages.length ===
                            0 && (
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        flexDirection:
                                            "column",
                                        gap:
                                            "8px"
                                    }}
                                >
                                    <p
                                        style={{
                                            margin:
                                                "8px 0 4px",
                                            color:
                                                "rgba(245, 246, 239, 0.72)",
                                            fontSize:
                                                "12px",
                                            lineHeight:
                                                "1.45"
                                        }}
                                    >
                                        Posso consultar o
                                        workspace e ajudar
                                        você a decidir o
                                        próximo passo.
                                    </p>

                                    {SUGGESTIONS.map(
                                        (
                                            suggestion
                                        ) => (
                                            <button
                                                key={
                                                    suggestion
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handleSendMessage(
                                                        suggestion
                                                    )
                                                }
                                                style={{
                                                    padding:
                                                        "9px 10px",
                                                    background:
                                                        "rgba(255, 255, 255, 0.07)",
                                                    border:
                                                        "1px solid rgba(255, 255, 255, 0.14)",
                                                    borderRadius:
                                                        "9px",
                                                    color:
                                                        "#f5f6ef",
                                                    fontSize:
                                                        "11px",
                                                    lineHeight:
                                                        "1.35",
                                                    textAlign:
                                                        "left",
                                                    cursor:
                                                        "pointer"
                                                }}
                                            >
                                                {suggestion}
                                            </button>
                                        )
                                    )}
                                </div>
                            )}

                        {messages.map(
                            (
                                message,
                                index
                            ) => (
                                <div
                                    key={`${message.role}-${index}`}
                                    style={{
                                        alignSelf:
                                            message.role ===
                                            "user"
                                                ? "flex-end"
                                                : "flex-start",
                                        maxWidth:
                                            "88%",
                                        padding:
                                            "10px 12px",
                                        background:
                                            message.role ===
                                            "user"
                                                ? "#f5f6ef"
                                                : "rgba(255, 255, 255, 0.1)",
                                        color:
                                            message.role ===
                                            "user"
                                                ? "#171815"
                                                : "#f5f6ef",
                                        borderRadius:
                                            "11px",
                                        fontSize:
                                            "12px",
                                        lineHeight:
                                            "1.45",
                                        whiteSpace:
                                            "pre-wrap"
                                    }}
                                >
                                    {
                                        message.content
                                    }
                                </div>
                            )
                        )}

                        {isSending && (
                            <div
                                style={{
                                    alignSelf:
                                        "flex-start",
                                    padding:
                                        "10px 12px",
                                    background:
                                        "rgba(255, 255, 255, 0.1)",
                                    borderRadius:
                                        "11px",
                                    color:
                                        "rgba(245, 246, 239, 0.72)",
                                    fontSize:
                                        "12px"
                                }}
                            >
                                Pensando...
                            </div>
                        )}
                    </div>

                    {chatError && (
                        <div
                            style={{
                                marginTop:
                                    "8px",
                                color:
                                    "#ffd3d3",
                                fontSize:
                                    "11px"
                            }}
                        >
                            {chatError}
                        </div>
                    )}

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        style={{
                            display:
                                "flex",
                            gap:
                                "8px",
                            marginTop:
                                "12px"
                        }}
                    >
                        <textarea
                            value={
                                input
                            }
                            onChange={(
                                event
                            ) =>
                                setInput(
                                    event.target.value
                                )
                            }
                            onKeyDown={
                                handleInputKeyDown
                            }
                            placeholder="Pergunte algo..."
                            rows={
                                2
                            }
                            maxLength={
                                500
                            }
                            disabled={
                                isSending
                            }
                            style={{
                                flex:
                                    "1",
                                resize:
                                    "none",
                                padding:
                                    "10px 11px",
                                background:
                                    "rgba(255, 255, 255, 0.08)",
                                border:
                                    "1px solid rgba(255, 255, 255, 0.18)",
                                borderRadius:
                                    "9px",
                                color:
                                    "#f5f6ef",
                                outline:
                                    "none",
                                font:
                                    "inherit",
                                fontSize:
                                    "12px",
                                lineHeight:
                                    "1.4"
                            }}
                        />

                        <button
                            type="submit"
                            disabled={
                                isSending ||
                                !input.trim()
                            }
                            style={{
                                alignSelf:
                                    "flex-end",
                                padding:
                                    "10px 13px",
                                background:
                                    "#f5f6ef",
                                border:
                                    "none",
                                borderRadius:
                                    "9px",
                                color:
                                    "#171815",
                                fontSize:
                                    "12px",
                                fontWeight:
                                    "800",
                                cursor:
                                    "pointer",
                                opacity:
                                    isSending ||
                                    !input.trim()
                                        ? 0.5
                                        : 1
                            }}
                        >
                            Enviar
                        </button>
                    </form>

                    <span
                        style={{
                            marginTop:
                                "7px",
                            color:
                                "rgba(245, 246, 239, 0.45)",
                            fontSize:
                                "9px"
                        }}
                    >
                        Enter envia · Shift + Enter quebra a linha
                    </span>
                </div>
            )}
        </div>
    );
}

export default AIAssistant;