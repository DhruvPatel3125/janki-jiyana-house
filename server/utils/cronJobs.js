import cron from 'node-cron';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const startCronJobs = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running auto-cancel job for unpaid UPI orders...');
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      // Find UPI QR orders that are still pending payment and were created more than 2 hours ago
      const unpaidOrders = await Order.find({
        paymentMethod: 'UPI_QR',
        paymentStatus: 'pending',
        status: 'Pending',
        createdAt: { $lte: twoHoursAgo }
      });

      if (unpaidOrders.length === 0) {
        console.log('[CRON] No unpaid orders to cancel.');
        return;
      }

      for (const order of unpaidOrders) {
        // Cancel the order
        order.status = 'Cancelled';
        order.paymentStatus = 'rejected'; // or 'cancelled' if we add that to enum, but rejected works to indicate failed payment
        
        // Restock items
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } }
          );
        }

        await order.save();
        console.log(`[CRON] Cancelled order ${order._id} due to non-payment and restocked inventory.`);
      }
    } catch (error) {
      console.error('[CRON] Error running auto-cancel job:', error);
    }
  });
};
