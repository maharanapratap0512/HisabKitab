# 📡 NetDrop Module: Technical Documentation

## 1. Overview
NetDrop is a local-network, Peer-to-Peer (P2P) file sharing system built into **HisabKitab**. It allows users on the same Wi-Fi to discover each other and transfer files directly between devices without uploading them to a central server.

---

## 2. Core Technologies
- **Socket.io**: Used for "Signaling" (discovery and handshaking).
- **WebRTC (RTCDataChannel)**: Used for the actual P2P file transfer (high-speed, direct).
- **Angular**: Frontend framework.
- **Node.js**: Backend socket server.

---

## 3. File Structure & Responsibilities

### 📂 Backend (`/backend/api/sockets/`)
- **`netdrop.socket.js`**: 
  - **Responsibility**: The "Matchmaker".
  - **Tasks**: 
    - Manages the `/netdrop` namespace.
    - Detects the server's local IP to generate the connection URL.
    - Relays "signals" between two users so they can find each other.

### 📂 Frontend (`/frontend/src/app/modules/netdrop/`)
- **`netdrop.service.ts`**: 
  - **Responsibility**: The "Engine".
  - **Tasks**: Handles the complex WebRTC lifecycle, splits files into binary chunks, and manages progress state.
- **`netdrop-ui/`**:
  - **`component.ts`**: Handles UI state (peers list, network detection, radar logic).
  - **`component.html`**: The 3-column layout (Setup, Radar, Instructions).
  - **`component.css`**: Premium animations (Radar sweep, Bubble pulse, Glassmorphism).

---

## 4. Deep-Dive: How it Works

### Phase A: Discovery (Signaling)
1. **Joining**: When a user opens NetDrop, the `NetdropService` connects to the socket server and emits a `join` event with a randomized name.
2. **IP Detection**: The server detects the local IP and sends it to all clients via `server-info` so they can show the connection URL.
3. **Peer List**: The server keeps a list of active users in the "NetDrop Room" and broadcasts the `peer-list` to everyone.

### Phase B: The Handshake (WebRTC)
When **User A** clicks on **User B**:
1. **Offer**: User A creates an "Offer" (a description of their connection capabilities) and sends it to User B via the Socket server.
2. **Answer**: User B receives the offer and sends back an "Answer".
3. **ICE Candidates**: Both devices exchange "ICE Candidates" (their network addresses) to find the fastest direct path between them.

### Phase C: Data Transfer
1. **DataChannel**: Once the handshake is complete, a direct P2P tunnel (`RTCDataChannel`) is opened.
2. **File Chunking**: The sender splits the file into small binary chunks (e.g., 64KB).
3. **Metadata**: Before sending binary, the sender sends a JSON string with the filename and size.
4. **Assembly**: The receiver collects these chunks in a buffer and tracks progress.
5. **Download**: When all chunks are received, the receiver creates a "Blob" and triggers a browser download automatically.

---

## 5. Key Functions & Logic

### 🔧 `NetdropService`
- **`connect()`**: Initializes socket listeners.
- **`rejoin()`**: Forcefully re-announces presence (used when Wi-Fi is toggled).
- **`sendFile(peerId, file)`**: The initiator of the P2P transfer. It reads the file using `FileReader` and pipes it to the DataChannel.
- **`handleSignal(from, signalData)`**: Reacts to incoming WebRTC offers/answers.

### 🎨 `NetdropUiComponent`
- **`getPeerStyle(index, total)`**: Calculates the (X, Y) coordinates to place devices in a circle around the radar center.
- **`getPeerColor(name)`**: Generates a unique color gradient for each device using a simple string-hashing algorithm.
- **`isOnline Detection`**: Uses `window.addEventListener('online/offline')` to clear the list and show warnings when Wi-Fi is lost.

---

## 6. How to Modify/Extend

### To change the Radar size:
Modify `radius` in `netdrop-ui.component.ts` -> `getPeerStyle`.

### To change the Transfer Speed:
Adjust `chunkSize` in `netdrop.service.ts` -> `sendFile`. (Currently 64KB, which is stable for mobile).

### To add more firewall tips:
Update the `side-panel` in `netdrop-ui.component.html`.

---

## 7. Developer Notes
> **⚠️ Security**: NetDrop is intended for local network use. In production environments with strict Firewalls/NATs, a **TURN Server** may be required to relay data if a direct P2P connection cannot be established.
