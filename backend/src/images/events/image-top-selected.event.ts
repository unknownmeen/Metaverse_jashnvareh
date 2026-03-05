/**
 * Event emitted when an admin marks an image as "Top" (featured).
 * The NotificationListener catches this and creates a notification
 * for the image owner — keeping Image and Notification domains decoupled.
 */
export class ImageTopSelectedEvent {
  constructor(
    public readonly imageId: string,
    public readonly imageOwnerId: string,
    public readonly imageTitle: string,
  ) {}
}
