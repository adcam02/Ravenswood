// Settings for this copy of the site.
//
// peer: where players' browsers find the Storyteller. Leave it as null to use the free
// PeerJS cloud server. If that ever stops working, run your own PeerServer
// (https://github.com/peers/peerjs-server) and put its details here, for example:
//   peer: { host: 'my-peer-server.onrender.com', port: 443, path: '/', secure: true }
//
// relay: a TURN relay for players whose network blocks a direct connection (some work, uni and phone
// hotspot networks). Without one, those players can't hear or reach anyone. A free account at
// https://www.metered.ca/stun-turn (or Cloudflare Calls TURN) gives you a username and credential;
// paste them here, for example:
//   relay: [
//     { urls: ['turn:global.relay.metered.ca:80', 'turn:global.relay.metered.ca:443?transport=tcp'],
//       username: 'xxxxxxxx', credential: 'xxxxxxxx' },
//   ],
// Leave it as null to use the free shared PeerJS relay, which works but is often busy.
window.RAVENSWOOD_CONFIG = {
  peer: null,
  relay: null,
};
