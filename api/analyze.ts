// This file is now a backup. Primary logic moved to App.tsx for better env detection.
export default async function handler(req: any, res: any) {
  return res.status(200).json({ message: "Analysis now handled directly on frontend for better reliability." });
}
