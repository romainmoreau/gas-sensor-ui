import { RxStompConfig } from "@stomp/rx-stomp";
import * as SockJS from "sockjs-client";

export const gasSensingRxStompConfig: RxStompConfig = {
  webSocketFactory: () => new SockJS("/api/stompEndpoint"),
  heartbeatIncoming: 0,
  heartbeatOutgoing: 20000,
  reconnectDelay: 200,
};
