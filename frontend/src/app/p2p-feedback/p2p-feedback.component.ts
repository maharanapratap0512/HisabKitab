import { Component, OnInit } from '@angular/core';
import Peer from 'peerjs';

@Component({
  selector: 'app-p2p-feedback',
  templateUrl: './p2p-feedback.component.html',
  styleUrls: ['./p2p-feedback.component.scss']
})
export class P2pFeedbackComponent implements OnInit {
  DB_KEY = 'fb_reports_db';
  RECEIVED_DB_KEY = 'fb_received_db';
  ADMIN_KEY = 'fb_admin_code';
  MY_ID_KEY = 'fb_my_id';
  MY_NAME_KEY = 'fb_my_name';
  ALIASES_KEY = 'fb_contact_aliases';
  KNOWN_CONTACTS_KEY = 'fb_known_contacts';

  reports: any[] = [];
  receivedReports: any[] = [];
  
  adminCode = '';
  myId = '';
  myName = 'User';

  knownContacts: any = {};
  onlineContacts = new Set<string>();
  contactAliases: any = {};
  selectedContactFilter = '';

  peer: any = null;
  isOnline = false;
  connToAdmin: any = null;

  reportTitle = '';
  reportDetail = '';
  reportImageData = '';
  imgPreviewUrl = '';

  adminCodeInp = '';

  toastMsg = '';
  showToastMsg = false;
  toastTimeout: any;

  ngOnInit() {
    this.reports = JSON.parse(localStorage.getItem(this.DB_KEY) || '[]');
    this.receivedReports = JSON.parse(localStorage.getItem(this.RECEIVED_DB_KEY) || '[]');
    this.contactAliases = JSON.parse(localStorage.getItem(this.ALIASES_KEY) || '{}');
    this.knownContacts = JSON.parse(localStorage.getItem(this.KNOWN_CONTACTS_KEY) || '{}');
    this.adminCode = localStorage.getItem(this.ADMIN_KEY) || '';
    this.adminCodeInp = this.adminCode;
    this.myId = localStorage.getItem(this.MY_ID_KEY) || '';
    this.myName = localStorage.getItem(this.MY_NAME_KEY) || 'User';
  }

  saveIdentity() {
    localStorage.setItem(this.MY_NAME_KEY, this.myName);
    this.showToast('✅ Name Saved!');
  }

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  showToast(msg: string, ms = 2500) {
    this.toastMsg = msg;
    this.showToastMsg = true;
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.showToastMsg = false, ms);
  }

  saveDb() {
    localStorage.setItem(this.DB_KEY, JSON.stringify(this.reports));
  }
  
  saveReceivedDb() {
    localStorage.setItem(this.RECEIVED_DB_KEY, JSON.stringify(this.receivedReports));
  }

  saveAliases() {
    localStorage.setItem(this.ALIASES_KEY, JSON.stringify(this.contactAliases));
  }

  saveKnownContacts() {
    localStorage.setItem(this.KNOWN_CONTACTS_KEY, JSON.stringify(this.knownContacts));
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (!file) {
      this.reportImageData = '';
      this.imgPreviewUrl = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.reportImageData = e.target.result;
      this.imgPreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  saveReport() {
    const title = this.reportTitle.trim();
    const detail = this.reportDetail.trim();
    if (!title || !detail) {
      this.showToast('⚠️ Title and Detail are required');
      return;
    }
    const report = {
      id: this.uid(),
      title,
      detail,
      image: this.reportImageData,
      timestamp: Date.now(),
      lastUpdated: Date.now(),
      status: 'PENDING',
      messages: []
    };
    this.reports.unshift(report);
    this.saveDb();
    
    this.reportTitle = '';
    this.reportDetail = '';
    this.reportImageData = '';
    this.imgPreviewUrl = '';

    this.showToast('✅ Saved locally!');

    if (this.isOnline && this.adminCode) {
      this.syncWithAdmin();
    }
  }

  linkAdmin() {
    const code = this.adminCodeInp.trim().toUpperCase();
    if (!code) {
      this.showToast('⚠️ Admin Code is required');
      return;
    }
    this.adminCode = code;
    localStorage.setItem(this.ADMIN_KEY, this.adminCode);
    this.showToast('✅ Linked!');
    if (!this.isOnline) {
      this.toggleOnline();
    } else {
      this.connectToAdmin();
    }
  }

  activeConns: { [id: string]: any } = {};
  audioCtx: any;

  initAudio() {
    if (!this.audioCtx) {
      try {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {}
    }
  }

  playBeep() {
    this.initAudio();
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      osc.type = 'sine';
      // Pleasant 'ding' notification
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
      
      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch(e) {}
  }

  toggleOnline() {
    this.initAudio();
    if (this.isOnline) this.goOffline();
    else this.initPeer();
  }

  goOffline() {
    if (this.peer) this.peer.destroy();
    this.peer = null;
    this.isOnline = false;
    this.connToAdmin = null;
    this.onlineContacts.clear();
    this.activeConns = {};
    this.showToast('🔌 Gone Offline');
  }

  initPeer() {
    if (!this.myId) {
      this.myId = 'U-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem(this.MY_ID_KEY, this.myId);
    }
    this.peer = new Peer(this.myId);

    this.peer.on('open', (id: string) => {
      this.isOnline = true;
      this.showToast('📡 Online!');
      if (this.adminCode) {
        this.connectToAdmin();
      }
    });

    this.peer.on('error', (err: any) => {
      console.error('Peer error:', err);
      this.showToast('❌ Connection Error: ' + err.type);
      this.goOffline();
    });

    this.peer.on('connection', (conn: any) => {
      conn.on('close', () => {
        this.onlineContacts.delete(conn.peer);
        delete this.activeConns[conn.peer];
      });

      conn.on('data', (data: any) => {
        this.activeConns[conn.peer] = conn;

        if (data.type === 'IDENTIFY') {
          this.knownContacts[conn.peer] = { name: data.name, lastSeen: Date.now() };
          this.onlineContacts.add(conn.peer);
          this.saveKnownContacts();
          this.showToast(`👤 ${data.name} connected`);
          
          const userReports = this.receivedReports.filter(r => r.fromId === conn.peer);
          if (userReports.length > 0) {
             conn.send({ type: 'SYNC_REPORTS', reports: userReports });
          }
        }
        
        if (data.type === 'SYNC_REPORTS') {
          const incomingReports = data.reports;
          let adminReceivedUpdated = false;
          let mySentUpdated = false;

          incomingReports.forEach((inc: any) => {
            const mergeReport = (existing: any) => {
              let updated = false;
              let needsEcho = false;
              
              const mergedMessages = [...(existing.messages || [])];
              let msgAdded = false;
              (inc.messages || []).forEach((m: any) => {
                 if (!mergedMessages.find(em => em.id === m.id)) {
                   mergedMessages.push(m);
                   msgAdded = true;
                 }
              });
              
              if (mergedMessages.length > (inc.messages || []).length) {
                 needsEcho = true; // We have messages they don't have
              }

              if (msgAdded) {
                mergedMessages.sort((a: any, b: any) => a.timestamp - b.timestamp);
                existing.messages = mergedMessages;
                updated = true;
                this.playBeep();
              }

              if ((inc.lastUpdated || 0) > (existing.lastUpdated || 0)) {
                const tempMsgs = existing.messages;
                Object.assign(existing, inc);
                existing.messages = tempMsgs;
                updated = true;
              } else if ((existing.lastUpdated || 0) > (inc.lastUpdated || 0)) {
                needsEcho = true; // Our status/details are newer
              }

              if (needsEcho) {
                 setTimeout(() => {
                   this.sendToPeer(conn.peer, { type: 'SYNC_REPORTS', reports: [existing] });
                 }, 200);
              }

              return updated;
            };

            let existingSent = this.reports.find(r => r.id === inc.id);
            if (existingSent) {
              if (mergeReport(existingSent)) mySentUpdated = true;
            } else {
              let existingReceived = this.receivedReports.find(r => r.id === inc.id);
              if (existingReceived) {
                if (!existingReceived.fromId) existingReceived.fromId = conn.peer;
                if (mergeReport(existingReceived)) adminReceivedUpdated = true;
              } else {
                if (!inc.fromId) inc.fromId = conn.peer;
                this.receivedReports.unshift(inc);
                adminReceivedUpdated = true;
                this.playBeep();
                
                // If they just sent us a brand new report, echo it back so they know we got it
                setTimeout(() => {
                   this.sendToPeer(conn.peer, { type: 'SYNC_REPORTS', reports: [inc] });
                }, 200);
              }
            }
          });

          if (mySentUpdated) {
             this.saveDb();
          }
          if (adminReceivedUpdated) {
             this.saveReceivedDb();
          }
        }
      });
    });
  }

  connectToAdmin() {
    if (!this.peer || !this.isOnline || !this.adminCode) return;
    const conn = this.peer.connect(this.adminCode);
    
    conn.on('open', () => {
      this.connToAdmin = conn;
      this.activeConns[this.adminCode] = conn;
      conn.send({ type: 'IDENTIFY', name: this.myName });
      this.showToast('🤝 Connected to Admin');
      this.syncWithAdmin();
    });
    
    conn.on('close', () => {
      this.connToAdmin = null;
      delete this.activeConns[this.adminCode];
    });

    conn.on('error', () => {
      this.showToast('❌ Admin might be offline');
    });
  }

  syncWithAdmin() {
    if (!this.connToAdmin || !this.connToAdmin.open) return;
    if (this.reports.length === 0) return;
    
    this.connToAdmin.send({
      type: 'SYNC_REPORTS',
      reports: this.reports
    });
  }

  getContactsKeys() {
    return Object.keys(this.knownContacts).sort((a, b) => {
      const aOn = this.onlineContacts.has(a) ? 1 : 0;
      const bOn = this.onlineContacts.has(b) ? 1 : 0;
      return bOn - aOn;
    });
  }

  isContactOnline(peerId: string) {
    return this.onlineContacts.has(peerId);
  }

  getContactName(peerId: string) {
    if (this.contactAliases[peerId]) return this.contactAliases[peerId];
    if (this.knownContacts[peerId]) return this.knownContacts[peerId].name;
    return peerId;
  }

  renameContact(peerId: string) {
    const newName = prompt('Enter a local name for this user:', this.getContactName(peerId));
    if (newName && newName.trim()) {
      this.contactAliases[peerId] = newName.trim();
      this.saveAliases();
    }
  }

  getIncomingMsgCount(peerId: string) {
    return this.receivedReports.filter(r => r.fromId === peerId).length;
  }

  toggleContactFilter(peerId: string) {
    if (this.selectedContactFilter === peerId) {
      this.selectedContactFilter = '';
    } else {
      this.selectedContactFilter = peerId;
    }
  }

  showResolved = false;

  getActiveReports() {
    if (this.showResolved) return this.reports;
    return this.reports.filter(r => r.status !== 'RESOLVED');
  }

  getActiveReceivedReports() {
    let list = this.receivedReports;
    if (this.selectedContactFilter) {
      list = list.filter(r => r.fromId === this.selectedContactFilter);
    }
    if (!this.showResolved) {
      list = list.filter(r => r.status !== 'RESOLVED');
    }
    return list;
  }

  addMessage(report: any, isReceived: boolean) {
    if (!report.newMsg || !report.newMsg.trim()) return;
    const msg = {
      id: this.uid(),
      senderName: this.myName,
      text: report.newMsg.trim(),
      timestamp: Date.now()
    };
    if (!report.messages) report.messages = [];
    report.messages.push(msg);
    report.newMsg = '';
    
    this.dispatchReportUpdate(report, isReceived);
  }

  changeStatus(report: any, status: string, isReceived: boolean) {
    report.status = status;
    this.dispatchReportUpdate(report, isReceived);
  }

  dispatchReportUpdate(report: any, isReceived: boolean) {
    report.lastUpdated = Date.now();
    
    if (isReceived) {
      this.saveReceivedDb();
      this.sendToPeer(report.fromId, { type: 'SYNC_REPORTS', reports: [report] });
    } else {
      this.saveDb();
      this.sendToPeer(this.adminCode, { type: 'SYNC_REPORTS', reports: [report] });
    }
  }

  sendToPeer(peerId: string, payload: any) {
    if (!this.peer) return;

    if (!peerId) {
       // Fallback: If we don't know the exact peer ID (e.g. legacy report), broadcast to all active connections
       let sent = false;
       Object.values(this.activeConns).forEach((c: any) => {
         if (c && c.open) {
           c.send(payload);
           sent = true;
         }
       });
       if (!sent) this.showToast('⚠️ No active connections to send to.');
       return;
    }
    
    // First try our custom active connections map
    const activeConn = this.activeConns[peerId];
    if (activeConn && activeConn.open) {
      activeConn.send(payload);
      return;
    }
    
    // Fallback to PeerJS internal connection array
    const conns = this.peer.connections[peerId];
    if (conns) {
      const fallbackConn = conns.find((c: any) => c.open);
      if (fallbackConn) {
        fallbackConn.send(payload);
        return;
      }
    }
    
    this.showToast('⚠️ Target peer is offline. Sync will happen when they connect.');
  }
}
