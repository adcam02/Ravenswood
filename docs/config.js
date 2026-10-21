// Settings for this copy of the site.
//
// peer: where players' browsers find the Storyteller. Leave it as null to use the free
// PeerJS cloud server. If that ever stops working, run your own PeerServer
// (https://github.com/peers/peerjs-server) and put its details here, for example:
//   peer: { host: 'my-peer-server.onrender.com', port: 443, path: '/', secure: true }
//
// relay: a TURN relay for players whose network blocks a direct connection (some work, uni and phone
// hotspot networks). Without one, those players can't hear or reach anyone. A free account at
// https://www.metered.ca/stun-turn gives you a username and credential; paste them here, for example:
//   relay: [
//     { urls: ['turn:global.relay.metered.ca:80', 'turn:global.relay.metered.ca:443?transport=tcp'],
//       username: 'xxxxxxxx', credential: 'xxxxxxxx' },
//   ],
// Leave it as null to use the free shared PeerJS relay, which works but is often busy.
window.RAVENSWOOD_CONFIG = {
  peer: null,
  // Our own Metered relay (credential created 21 Oct 2026), pinned to Australia (au.relay.metered.ca) since
  // everyone plays from here. To change it, make a new credential in the Metered dashboard (TURN Server, then
  // Credentials) and swap the username and credential below; if the region changes there, copy the addresses
  // from "Show ICE Servers Array" too.
  relay: [
    { urls: 'stun:stun.relay.metered.ca:80' },
    {
      urls: [
        'turn:au.relay.metered.ca:80',
        'turn:au.relay.metered.ca:80?transport=tcp',
        'turn:au.relay.metered.ca:443',
        'turns:au.relay.metered.ca:443?transport=tcp',
      ],
      username: '66e3ca55209153d9669e0112',
      credential: 'fRCUesiC+CzFi/xK',
    },
  ],
};
