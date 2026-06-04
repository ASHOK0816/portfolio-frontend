import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let client = null;
let isConnected = false;

export const connectSocket = (onMessage) => {
  if (client?.connected) return client;

  const socket = new SockJS("http://localhost:8080/ws");

  client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,

    onConnect: () => {
      isConnected = true;
      client.subscribe("/topic/messages", (msg) => {
        onMessage?.(JSON.parse(msg.body));
      });
    }
  });

  client.activate();

  return client;
};

export const disconnectSocket = () => {
  if (client) {
    client.deactivate();
    client = null;
  }
};