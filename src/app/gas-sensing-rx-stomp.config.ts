import { InjectableRxStompConfig } from '@stomp/ng2-stompjs';
import * as SockJS from 'sockjs-client';

export const gasSensingRxStompConfig: InjectableRxStompConfig = {
  webSocketFactory: () => new SockJS('/api/stompEndpoint'),
  heartbeatIncoming: 0,
  heartbeatOutgoing: 20000,
  reconnectDelay: 200
};
