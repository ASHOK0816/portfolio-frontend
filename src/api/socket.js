import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let client = null;

export const connectSocket = (onMessage) => {
  if (client && client.connected) return client;

  const socket = new SockJS("http://localhost:8080/ws");

  client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
  });

  client.onConnect = () => {
    client.subscribe("/topic/messages", (msg) => {
      const data = JSON.parse(msg.body);
      onMessage?.(data);
    });
  };

  client.activate();

  return client;
};

export const disconnectSocket = () => {
  if (client) {
    client.deactivate();
    client = null;
  }
};