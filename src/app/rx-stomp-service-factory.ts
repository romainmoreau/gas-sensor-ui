import { gasSensingRxStompConfig } from "./gas-sensing-rx-stomp.config";
import { RxStompService } from "./rx-stomp.service";

export function rxStompServiceFactory() {
  const rxStomp = new RxStompService();
  rxStomp.configure(gasSensingRxStompConfig);
  rxStomp.activate();
  return rxStomp;
}
