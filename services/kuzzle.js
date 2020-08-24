import { Kuzzle, WebSocket } from "kuzzle-sdk";

export default new Kuzzle(new WebSocket("192.168.1.20"), {});
