/* eslint-disable import/no-extraneous-dependencies */
//Socket.IO is a JavaScript library for real-time web applications. It enables bidirectional communication between clients 
const socketIO = require('socket.io');

let io;

function initializeSocket(server) {
  io = socketIO(server);

  io.on('connection', (socket) => {
    console.log('A business owner connected');

    socket.on('messageFromCustomer', async ({ ownerID, customerID }) => {
      try {
        // Handle the incoming message
        // Example: const result = await BusinessOwnerService.handleCustomerMessage(ownerID, customerID, message);

        // Emit the updated messages to the business owner and customer
        io.to(ownerID).emit('updatedMessages', {
          /* Update with relevant data based on your implementation */
        });

        io.to(customerID).emit('updatedMessages', {
          /* Update with relevant data based on your implementation */
        });
      } catch (error) {
        console.error('Error handling incoming message:', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('A business owner disconnected');
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = { initializeSocket, getIO };
