const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
    console.log('Connected to WebSocket server');
    
    // Join room
    console.log('Sending JOIN_ROOM...');
    ws.send(JSON.stringify({
        type: 'JOIN_ROOM',
        roomId: 'test-room',
        userId: 'test-user'
    }));
});

ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('Received:', JSON.stringify(message, null, 2));
    
    if (message.type === 'ROOM_JOINED') {
        console.log('Joined room successfully!');
        
        // Send a drawing event
        setTimeout(() => {
            console.log('Sending DRAW_LINE...');
            ws.send(JSON.stringify({
                type: 'DRAW_LINE',
                userId: 'test-user',
                roomId: 'test-room',
                points: [[10, 10], [50, 50]],
                color: '#FF0000',
                strokeWidth: 2
            }));
        }, 1000);
    }
    
    if (message.type === 'EVENT') {
        console.log('Event processed! Sequence:', message.payload.sequence);
        setTimeout(() => {
            ws.close();
            console.log('Test complete!');
        }, 1000);
    }
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

ws.on('close', () => {
    console.log('Disconnected');
});