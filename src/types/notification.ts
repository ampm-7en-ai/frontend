export const NotificationTypes = {
    TRAINING_STARTED: 'training_started',
    TRAINING_COMPLETED: 'training_completed',
    TRAINING_FAILED: 'training_failed',
    DEFAULT: 'default'
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];