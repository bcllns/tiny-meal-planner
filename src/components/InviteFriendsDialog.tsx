import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface InviteFriendsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteFriendsDialog({ isOpen, onClose }: InviteFriendsDialogProps) {
  const [contacts, setContacts] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Email validation regex
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      if (!supabase) throw new Error("Database not configured");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Parse email addresses - split by newlines, commas, or semicolons
      const emailList = contacts
        .split(/[\n,;]+/)
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      if (emailList.length === 0) {
        setError("Please enter at least one email address");
        setIsSubmitting(false);
        return;
      }

      // Validate all email addresses
      const invalidEmails = emailList.filter((email) => !isValidEmail(email));
      if (invalidEmails.length > 0) {
        setError(`Invalid email address${invalidEmails.length > 1 ? "es" : ""}: ${invalidEmails.join(", ")}`);
        setIsSubmitting(false);
        return;
      }

      // Get the current session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("No active session");

      // Call the Edge Function to send invites
      console.log("Calling Edge Function with emails:", emailList);
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

      let response;
      try {
        response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ emails: emailList }),
        });
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : "Unable to connect to server"}`);
      }

      console.log("Response status:", response.status, response.statusText);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      let result;
      const contentType = response.headers.get("content-type");
      console.log("Content-Type:", contentType);

      try {
        const responseText = await response.text();
        console.log("Raw response text:", responseText);

        if (responseText) {
          result = JSON.parse(responseText);
          console.log("Parsed response:", result);
        } else {
          console.error("Empty response body");
          throw new Error(`Server returned empty response. Status: ${response.status}`);
        }
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error(`Server returned invalid response. Status: ${response.status}`);
      }

      if (!response.ok) {
        console.error("Edge Function error details:", {
          status: response.status,
          statusText: response.statusText,
          result: result,
          error: result?.error,
          message: result?.message,
          details: result?.details,
        });

        const errorMsg = result?.error || result?.message || `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      } // Check results
      if (result.failed > 0) {
        if (result.sent > 0) {
          setError(`Sent ${result.sent} invite(s), but ${result.failed} failed. Please check the email addresses and try again.`);
        } else {
          throw new Error("All invites failed to send. Please try again.");
        }
      } else {
        setSuccess(true);
        setContacts("");
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invites");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invite Friends</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={isSubmitting}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="contacts" className="block text-sm font-medium text-gray-700 mb-2">
              Email addresses
            </label>
            <textarea
              id="contacts"
              value={contacts}
              onChange={(e) => setContacts(e.target.value)}
              placeholder="Enter email addresses (one per line, or separated by commas)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple email addresses with commas or new lines</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

          {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">Invitation emails sent successfully!</div>}

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Invites"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
