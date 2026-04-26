import { api } from '@/lib/axios'

export const chatbotService = {
  getSessions: () => api.get('/chatbot/sessions'),
  createSession: () => api.post('/chatbot/sessions'),
  getSession: (id: string) => api.get(`/chatbot/sessions/${id}`),
  deleteSession: (id: string) => api.delete(`/chatbot/sessions/${id}`),
  sendMessage: (sessionId: string, message: string) =>
    api.post(`/chatbot/sessions/${sessionId}/messages`, { message }),
}
