const mongoose = require('mongoose');
const DeliveryTracking = require('../../models/DeliveryTracking');

describe('DeliveryTracking Model Test - Status Enum Validation', () => {
  it('should invalidate an incorrect status string', () => {
    const tracking = new DeliveryTracking({
      orderId: new mongoose.Types.ObjectId(),
      currentLocation: { latitude: 12.9716, longitude: 77.5946 },
      destinationLocation: { latitude: 12.9716, longitude: 77.5946, address: 'Test Address' },
      status: 'Invalid Status String'
    });

    const error = tracking.validateSync();
    expect(error.errors['status']).toBeDefined();
    expect(error.errors['status'].message).toContain('is not a valid enum value');
  });

  it('should validate all correct status strings', () => {
    const validStatuses = ['Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'];

    validStatuses.forEach(status => {
      const tracking = new DeliveryTracking({
        orderId: new mongoose.Types.ObjectId(),
        currentLocation: { latitude: 12.9716, longitude: 77.5946 },
        destinationLocation: { latitude: 12.9716, longitude: 77.5946, address: 'Test Address' },
        status: status
      });

      const error = tracking.validateSync();
      expect(error).toBeUndefined();
    });
  });

  it('should default to Pending status when no status is provided', () => {
    const tracking = new DeliveryTracking({
      orderId: new mongoose.Types.ObjectId(),
      currentLocation: { latitude: 12.9716, longitude: 77.5946 },
      destinationLocation: { latitude: 12.9716, longitude: 77.5946, address: 'Test Address' }
    });

    expect(tracking.status).toBe('Pending');
    const error = tracking.validateSync();
    expect(error).toBeUndefined();
  });
});
