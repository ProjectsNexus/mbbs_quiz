export type NotificationDoc = {
  id: string;
  type: string;
  title: string;
  student?: string;
  quizTitle?: string;
  score?: number;
  totalMarks?: number;
  percentage?: number;
  batch?: string;
  timeSpent?: number;
  sentAt?: any; // Firestore Timestamp or plain object
  isRead: boolean;
};

export function formatNotificationMessage(doc: NotificationDoc): string {
  switch (doc.type) {
    case "result_published":
      return `${doc.student ?? "A student"} scored ${doc.score}/${doc.totalMarks} (${doc.percentage}%) in "${doc.quizTitle}" (${doc.batch}). Time spent: ${doc.timeSpent} seconds.`;

    case "quiz_assigned":
      return `A new quiz "${doc.quizTitle}" has been assigned to ${doc.batch}.`;

    case "quiz_add":
      return `A new quiz "${doc.quizTitle}" was created.`;

    case "user_add":
      return `${doc.student ?? "A new student"} has joined ${doc.batch}.`;

    case "announcement":
      return doc.title;

    default:
      return "You have a new notification.";
  }
}

export function formatNotificationTime(sentAt: any): string {
  const date = sentAt?.toDate
    ? sentAt.toDate()
    : new Date(sentAt.seconds * 1000 + sentAt.nanoseconds / 1000000);

  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
