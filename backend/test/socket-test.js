// --- Setup/Dependencies ---
const { expect } = require('chai');
const { io: Client } = require('socket.io-client');
const mongoose = require('mongoose');

// Mock dependencies that the live server might use (Note: This assumes 
// your running server uses dependency injection; otherwise, you must 
// pre-seed your test database for reliable results).
const mockLogger = { info: () => {}, warn: () => {} };
const mockConversation = { findOne: async () => ({}) };
const mockMessage = { create: async () => ({}) };


// --- Test Utilities and Configuration ---

// We assume the server is running on this port
const port = 4000;
const TEST_USER_ID = '60c72b2f901d8e15c48b29f0';

const connectClient = (userId) => {
    // Determine headers based on whether userId is provided
    const headers = userId ? { 'userid': userId } : {};

    // Connects to the external, already running server
    return Client(`http://localhost:${port}`, {
        transports: ['websocket'],
        forceNew: true, // Important for isolated tests
        // CONDITIONAL: Only include extraHeaders if userId is present
        extraHeaders: headers
    });
};

// --- Mocha Test Suite ---

describe('Socket.IO Connection and Authorization (External Server)', () => {
    
    // Removed server setup/teardown: The application server is assumed to be running.
    before((done) => {
        // No server start logic needed
        done();
    });
    
    // Clear client connections after each test
    afterEach((done) => {
        // Best-effort cleanup (rely on client disconnection)
        done();
    });

    it('should allow a connection when userId is present (Auth check)', (done) => {
        const client = connectClient(TEST_USER_ID);

        client.on('connect', () => {
            expect(client.connected).to.be.true;
            // NOTE: Server-side room checks are omitted as we don't have access to ioServer.
            client.disconnect();
            done();
        });
        
        client.on('connect_error', (err) => {
            client.disconnect();
            done(new Error(`Connection failed: ${err.message}`));
        });
    });

    it('should reject and disconnect if userId is NOT present (Auth check)', (done) => {
        const client = connectClient(null); // No headers passed in now.

        // Fail path: If we connect, the auth check failed on the server.
        client.on('connect', () => {
            client.disconnect();
            // This is the error you are seeing, indicating a server-side bug.
            done(new Error('Client connected successfully when it should have been rejected. Check your server-side session/auth middleware.'));
        });

        // Success path: We expect the server to kick us off immediately.
        client.on('disconnect', (reason) => {
            if (reason === 'io server disconnect') {
                done();
            } else {
                // If it disconnects for another reason, it might still be a failure.
                done(new Error(`Disconnected for unexpected reason: ${reason}`));
            }
        });
        
        // Safety timeout in case the connection hangs entirely
        client.io.timeout(500).then(() => {
            if (!client.connected) return;
            client.disconnect();
            done(new Error('Timeout: Client remained connected without authentication (check server logs).'));
        });
    });

    it('should handle multiple simultaneous connections correctly', (done) => {
        const userA = 'userA_id';
        const userB = 'userB_id';
        let connectedCount = 0;

        const clientA = connectClient(userA);
        const clientB = connectClient(userB);
        
        const checkDone = () => {
            connectedCount++;
            if (connectedCount === 2) {
                clientA.disconnect();
                clientB.disconnect();
                done();
            }
        };

        clientA.on('connect', checkDone);
        clientB.on('connect', checkDone);
    });
});

describe('Socket.IO Event Handling (External Server)', () => {
    let clientA;
    const userA = 'userA_id_2';
    // IMPORTANT: These IDs must exist in the live database associated with the running server.
    const validConvoId = '60c72b2f901d8e15c48b29f9'; 
    const invalidConvoId = '60c72b2f901d8e15c48b29fa';
    
    beforeEach((done) => {
        // Connect client before each event test
        clientA = connectClient(userA);
        clientA.on('connect', done);
    });

    afterEach(() => {
        if (clientA && clientA.connected) {
            clientA.disconnect();
        }
    });

    it('should join a conversation room and emit success event (requires DB setup)', function (done) {
        // Increased timeout to 10000ms for database operations
        this.timeout(10000); 
        
        // This log is critical for debugging the timeout failure (Error 2).
        console.warn(`\n=== 🚨 DEBUG ALERT 🚨 ===\nIf this test fails due to timeout, you MUST verify in your live database that: \n1. Conversation ID "${validConvoId}" exists.\n2. User ID "${userA}" is explicitly listed as a participant in that conversation.\n==========================\n`);

        // This test relies entirely on the live server successfully finding the conversation in the database.
        clientA.emit('join:conversation', { conversationId: validConvoId });
        
        clientA.on('join:conversation:ok', (data) => {
            expect(data.conversationId).to.equal(validConvoId);
            done();
        });
    });

    it('should NOT join a conversation if the user is not a participant (requires DB setup)', (done) => {
        // Ensure no success event is received
        clientA.on('join:conversation:ok', () => {
            done(new Error('Received success event for a forbidden conversation.'));
        });
        
        clientA.emit('join:conversation', { conversationId: invalidConvoId });
        
        // Wait briefly to ensure no unauthorized event was received
        setTimeout(() => {
            // Success is defined by the absence of the 'join:conversation:ok' event.
            done();
        }, 50); 
    });
});
