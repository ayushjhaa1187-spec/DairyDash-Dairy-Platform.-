const mongoose = require("mongoose");
const DeliveryTracking = require("../../models/DeliveryTracking");

describe("DeliveryTracking Model Test", () => {
  it("should validate a correctly constructed delivery tracking document", async () => {
    const validDeliveryTracking = new DeliveryTracking({
      orderId: new mongoose.Types.ObjectId(),
      currentLocation: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: "Bangalore"
      },
      destinationLocation: {
        latitude: 12.9352,
        longitude: 77.6245,
        address: "Koramangala"
      },
      status: "Pending"
    });

    const error = validDeliveryTracking.validateSync();
    expect(error).toBeUndefined();
  });

  it("should require orderId field", () => {
    const deliveryTracking = new DeliveryTracking({
      currentLocation: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: "Bangalore"
      },
      destinationLocation: {
        latitude: 12.9352,
        longitude: 77.6245,
        address: "Koramangala"
      }
    });

    const error = deliveryTracking.validateSync();
    expect(error.errors["orderId"]).toBeDefined();
    expect(error.errors["orderId"].message).toBe("Path `orderId` is required.");
  });

  it("should require currentLocation.latitude field", () => {
    const deliveryTracking = new DeliveryTracking({
      orderId: new mongoose.Types.ObjectId(),
      currentLocation: {
        longitude: 77.5946,
        address: "Bangalore"
      },
      destinationLocation: {
        latitude: 12.9352,
        longitude: 77.6245,
        address: "Koramangala"
      }
    });

    const error = deliveryTracking.validateSync();
    expect(error.errors["currentLocation.latitude"]).toBeDefined();
    expect(error.errors["currentLocation.latitude"].message).toBe("Path `currentLocation.latitude` is required.");
  });

  it("should require currentLocation.longitude field", () => {
    const deliveryTracking = new DeliveryTracking({
      orderId: new mongoose.Types.ObjectId(),
      currentLocation: {
        latitude: 12.9716,
        address: "Bangalore"
      },
      destinationLocation: {
        latitude: 12.9352,
        longitude: 77.6245,
        address: "Koramangala"
      }
    });

    const error = deliveryTracking.validateSync();
    expect(error.errors["currentLocation.longitude"]).toBeDefined();
    expect(error.errors["currentLocation.longitude"].message).toBe("Path `currentLocation.longitude` is required.");
  });

  it("should require destinationLocation.latitude field", () => {
    const deliveryTracking = new DeliveryTracking({
      orderId: new mongoose.Types.ObjectId(),
      currentLocation: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: "Bangalore"
      },
      destinationLocation: {
        longitude: 77.6245,
        address: "Koramangala"
      }
    });

    const error = deliveryTracking.validateSync();
    expect(error.errors["destinationLocation.latitude"]).toBeDefined();
    expect(error.errors["destinationLocation.latitude"].message).toBe("Path `destinationLocation.latitude` is required.");
  });

  it("should require destinationLocation.longitude field", () => {
    const deliveryTracking = new DeliveryTracking({
      orderId: new mongoose.Types.ObjectId(),
      currentLocation: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: "Bangalore"
      },
      destinationLocation: {
        latitude: 12.9352,
        address: "Koramangala"
      }
    });

    const error = deliveryTracking.validateSync();
    expect(error.errors["destinationLocation.longitude"]).toBeDefined();
    expect(error.errors["destinationLocation.longitude"].message).toBe("Path `destinationLocation.longitude` is required.");
  });

  it("should require destinationLocation.address field", () => {
    const deliveryTracking = new DeliveryTracking({
      orderId: new mongoose.Types.ObjectId(),
      currentLocation: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: "Bangalore"
      },
      destinationLocation: {
        latitude: 12.9352,
        longitude: 77.6245
      }
    });

    const error = deliveryTracking.validateSync();
    expect(error.errors["destinationLocation.address"]).toBeDefined();
    expect(error.errors["destinationLocation.address"].message).toBe("Path `destinationLocation.address` is required.");
  });

  it("should have default status \"Pending\"", () => {
    const deliveryTracking = new DeliveryTracking({
      orderId: new mongoose.Types.ObjectId(),
      currentLocation: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: "Bangalore"
      },
      destinationLocation: {
        latitude: 12.9352,
        longitude: 77.6245,
        address: "Koramangala"
      }
    });

    expect(deliveryTracking.status).toBe("Pending");
  });

  it("should fail validation if status is invalid", () => {
    const deliveryTracking = new DeliveryTracking({
      orderId: new mongoose.Types.ObjectId(),
      currentLocation: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: "Bangalore"
      },
      destinationLocation: {
        latitude: 12.9352,
        longitude: 77.6245,
        address: "Koramangala"
      },
      status: "InvalidStatus"
    });

    const error = deliveryTracking.validateSync();
    expect(error.errors["status"]).toBeDefined();
    expect(error.errors["status"].message).toBe("`InvalidStatus` is not a valid enum value for path `status`.");
  });
});
