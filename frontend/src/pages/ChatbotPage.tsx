import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatbotService } from "@/features/chatbot/services/chatbotService";
import type { ChatSession, ChatMessage } from "@/types/api";
import "@/assets/chatbot.css";

export default function ChatbotPage() {
  const qc = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions } = useQuery({
    queryKey: ["chatbot-sessions"],
    queryFn: () =>
      chatbotService.getSessions().then((r) => r.data?.data ?? r.data),
  });

  const { data: activeSession } = useQuery({
    queryKey: ["chatbot-session", activeSessionId],
    queryFn: () =>
      chatbotService
        .getSession(activeSessionId!)
        .then((r) => r.data?.data ?? r.data),
    enabled: !!activeSessionId,
  });

  const { mutate: createSession, isPending: creating } = useMutation({
    mutationFn: chatbotService.createSession,
    onSuccess: (res) => {
      const s = res.data?.data ?? res.data;
      qc.invalidateQueries({ queryKey: ["chatbot-sessions"] });
      setActiveSessionId(s.id);
    },
  });

  const { mutate: deleteSession } = useMutation({
    mutationFn: chatbotService.deleteSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatbot-sessions"] });
      setActiveSessionId(null);
    },
  });

  const { mutate: sendMessage, isPending: sending } = useMutation({
    mutationFn: (message: string) =>
      chatbotService.sendMessage(activeSessionId!, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatbot-session", activeSessionId] });
      setInput("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, sending]);

  const sessionList: ChatSession[] = Array.isArray(sessions) ? sessions : [];
  const messages: ChatMessage[] = activeSession?.messages ?? [];

  const handleSend = () => {
    if (!input.trim() || sending) return;
    if (!activeSessionId) {
      createSession(undefined, {
        onSuccess: (res) => {
          const s = res.data?.data ?? res.data;
          chatbotService.sendMessage(s.id, input.trim()).then(() => {
            qc.invalidateQueries({ queryKey: ["chatbot-session", s.id] });
            setInput("");
          });
        },
      });
    } else {
      sendMessage(input.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1>Trợ lý AI Sức khoẻ</h1>
          <p>Tư vấn dinh dưỡng & tập luyện cá nhân hoá</p>
        </div>
        <div className="topbar-right">
          <button
            className="btn btn-ghost2 btn-sm"
            onClick={() => setActiveSessionId(null)}
          >
            + Cuộc trò chuyện mới
          </button>
        </div>
      </div>

      <div className="chat-layout">
        {/* History sidebar */}
        <div className="chat-history hidden md:flex">
          <div className="chat-history-header">
            <span className="chat-history-title">Lịch sử</span>
            <button
              className="new-chat-btn"
              onClick={() => setActiveSessionId(null)}
              title="Cuộc trò chuyện mới"
            >
              +
            </button>
          </div>
          <div className="history-search">
            <input type="text" placeholder="Tìm cuộc trò chuyện..." />
          </div>
          <div className="history-list">
            <div className="history-section-label">Gần đây</div>
            {sessionList.map((s) => (
              <div
                key={s.id}
                className={`history-item ${
                  activeSessionId === s.id ? "active" : ""
                }`}
                onClick={() => setActiveSessionId(s.id)}
              >
                <div className="history-title">
                  {/* Optional: compute title from first message */}Cuộc trò
                  chuyện {new Date(s.createdAt).toLocaleDateString()}
                </div>
                <div className="history-meta">
                  <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                  <span
                    style={{ marginLeft: "auto", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(s.id);
                    }}
                  >
                    Huỷ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat main */}
        <div
          className="chat-main"
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid var(--border)",
            marginRight: "24px",
          }}
        >
          <div className="chat-header">
            <div className="ai-avatar">🤖</div>
            <div>
              <div className="ai-name">
                Tracker AI — Chuyên gia Dinh dưỡng & Thể thao
              </div>
              <div className="ai-status">Sẵn sàng tư vấn</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="btn btn-ghost2 btn-sm">Xuất PDF</button>
              <button className="btn btn-ghost2 btn-sm">Chia sẻ</button>
            </div>
          </div>

          <div className="messages" id="messages">
            {/* AI greeting if no active session */}
            {!activeSessionId && messages.length === 0 && (
              <div className="msg ai">
                <div className="msg-avatar">🤖</div>
                <div>
                  <div className="msg-bubble">
                    Xin chào! Tôi là trợ lý AI của Tracker, được huấn luyện bởi
                    đội ngũ chuyên gia dinh dưỡng và thể thao hàng đầu.
                    <br />
                    <br />
                    Tôi có thể giúp bạn:
                    <ul
                      style={{
                        marginTop: 8,
                        paddingLeft: 18,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <li>Tư vấn chế độ ăn uống phù hợp mục tiêu</li>
                      <li>Phân tích báo cáo dinh dưỡng của bạn</li>
                      <li>Gợi ý thực đơn và công thức lành mạnh</li>
                      <li>Lập kế hoạch tập luyện cá nhân hoá</li>
                      <li>Giải đáp mọi câu hỏi về sức khoẻ</li>
                    </ul>
                  </div>
                  <div className="msg-time">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`msg ${msg.role === "user" ? "user" : "ai"}`}
              >
                <div className="msg-avatar">
                  {msg.role === "user" ? "TM" : "🤖"}
                </div>
                <div>
                  <div className="msg-bubble">{msg.content}</div>
                  <div className="msg-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {sending && (
              <div className="msg ai">
                <div className="msg-avatar">🤖</div>
                <div>
                  <div className="msg-bubble">
                    <div className="typing">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion chips (only when starting a new chat) */}
          {!activeSessionId && (
            <div className="suggestion-chips">
              <div
                className="chip"
                onClick={() => setInput("Phân tích báo cáo tuần này")}
              >
                Phân tích báo cáo tuần này
              </div>
              <div
                className="chip"
                onClick={() => setInput("Lịch tập tuần tới cho tôi")}
              >
                Lịch tập tuần tới cho tôi
              </div>
              <div
                className="chip"
                onClick={() => setInput("Công thức bữa sáng giàu protein")}
              >
                Công thức bữa sáng giàu protein
              </div>
              <div
                className="chip"
                onClick={() => setInput("Tôi có nên dùng creatine?")}
              >
                Tôi có nên dùng creatine?
              </div>
            </div>
          )}

          {/* Input */}
          <div className="chat-input-area border-t !border-[#c9e4d4]">
            <div className="input-box">
              <div className="input-actions">
                <button className="input-action-btn" title="Đính kèm file">
                  📎
                </button>
                <button className="input-action-btn" title="Gửi ảnh bữa ăn">
                  📷
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về dinh dưỡng, tập luyện, sức khoẻ..."
                rows={1}
                disabled={sending || creating}
                style={{ height: "auto" }}
              />
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!input.trim() || sending || creating}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path d="M2 8l12-6-6 12-2-4-4-2z" fill="white" />
                </svg>
              </button>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Tracker AI có thể mắc lỗi. Tham khảo chuyên gia y tế cho quyết
              định quan trọng.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
