import { ref, onMounted, onUnmounted } from "vue";
import { io } from "socket.io-client";

export function useChatSocket({ url, token }) {
  let socket = null;                     
  const status = ref("disconnected");
  const lastError = ref(null);
  const messages = ref([]);
  const typing = ref([]);
  const onlineUsers = ref(new Set());
  const MAX_MESSAGES = 100;
  
  const connect = () => {
    socket = io(url, {
      path: "/ws/",
      transports: ["websocket"],
      auth: { token },
    });

    status.value = "connecting";           
    socket.on("connect", () => {
      status.value = "connected";
      socket.emit("message", {            
        type: "auth",
        payload: { token },
      });
    });

    socket.on("connect_error", (err) => {
      status.value = "error";
      lastError.value = err.message;
    });

    socket.on("message", (frame) => {
      handleFrame(frame);
    });

    socket.on("disconnect", () => {
      status.value = "disconnected";
    });
  };

  const handleFrame = (frame) => {
    switch (frame.type) {
      case "auth:ok":
        status.value = "authenticated";
        break;
      case "auth:error":
        status.value = "auth_failed";
        break;
      case "message:new":
      case "msgToSelf":
        
        messages.value.push(frame.payload);
        
        //  console.log('payload:', JSON.stringify(frame.payload))
        if (messages.value.length > MAX_MESSAGES) {
          messages.value.shift();
        }
        break;
      case "typing":
        if (!typing.value.includes(frame.payload.fromUsername)) {
          typing.value.push(frame.payload.fromUsername);
          setTimeout(() => {
            typing.value = typing.value.filter(u => u !== frame.payload.fromUsername);
          }, 2000);
        }
        break;
      case "presence:update":
        if (frame.payload.online) {
          onlineUsers.value.add(frame.payload.userId);
        } else {
          onlineUsers.value.delete(frame.payload.userId);
        }
        break;
      case "User:doesnt exist":
        messages.value.push(frame.payload);
        if (messages.value.length > MAX_MESSAGES) {
          messages.value.shift();
        }
        break;

    }
  };

  const send = (type, payload = {}) => {
    socket?.emit("message", { type, payload });  
  };
  const sendMessage = (content, to = null) => send("message:send", { content, to });
  const sendTyping = (to = null) => send("typing", { to });
  const sendReadReceipts = (messageIds) => {
    for (const messageId of messageIds) {
      send("read", { messageId });
    }
  };
  const sendRead = (messageId) => send("read", { messageId });

  onMounted(connect);
  onUnmounted(() => {
    const s = socket;
    socket = null;
    if (!s) return;
    if (s.connected) {
      s.disconnect();
      return;
    }
    s.once("connect", () => s.disconnect());
    s.once("connect_error", () => s.disconnect());
  });
  return { status, lastError, messages, typing, onlineUsers, sendMessage, sendTyping, sendRead };
}