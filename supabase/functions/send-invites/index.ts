import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  emails: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("Authorization header present:", !!authHeader);

    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client with the user's auth token
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    console.log("Supabase URL configured:", !!supabaseUrl);
    console.log("Supabase Anon Key configured:", !!supabaseAnonKey);

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing");
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Verify user is authenticated using the JWT token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    console.log("User authenticated:", !!user, "User ID:", user?.id, "Error:", userError?.message);

    if (userError || !user) {
      console.error("Authentication failed:", {
        error: userError,
        hasToken: !!token,
        tokenLength: token?.length,
      });
      throw new Error(`Unauthorized: ${userError?.message || "No user found"}`);
    }

    // Parse request body
    const { emails }: InviteRequest = await req.json();

    console.log("Received emails:", emails?.length || 0);

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new Error("Invalid email list");
    }

    // Create admin client with service role key
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    console.log("Service role key configured:", !!serviceRoleKey);

    if (!serviceRoleKey) {
      throw new Error("Service role key not configured - cannot send invites");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Process each invite
    console.log(`Processing ${emails.length} invites for user ${user.id}`);

    const results = await Promise.allSettled(
      emails.map(async (email) => {
        console.log(`Processing invite for: ${email}`);

        // Create the invite record first
        const { data: inviteData, error: inviteError } = await supabaseClient
          .from("invites")
          .insert({
            invited_by: user.id,
            email: email,
          })
          .select("invite_id")
          .single();

        if (inviteError) {
          console.error(`Failed to create invite record for ${email}:`, inviteError);
          throw new Error(`Failed to create invite record for ${email}: ${inviteError.message}`);
        }

        console.log(`Created invite record for ${email} with ID: ${inviteData.invite_id}`);

        // Get the redirect URL with invite tracking
        const redirectUrl = `${req.headers.get("origin") || Deno.env.get("APP_URL") || ""}?invite=${inviteData.invite_id}`;

        console.log(`Sending invite email to ${email} with redirect: ${redirectUrl}`);

        // Send the invite email using admin client
        const { error: inviteEmailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          redirectTo: redirectUrl,
          data: {
            invited_by: user.id,
            invite_id: inviteData.invite_id,
            invited_by_name: user.user_metadata?.full_name || user.email,
          },
        });

        if (inviteEmailError) {
          console.error(`Failed to send invite email to ${email}:`, inviteEmailError);
          // If email fails, mark the invite record appropriately or delete it
          await supabaseClient.from("invites").delete().eq("invite_id", inviteData.invite_id);
          throw new Error(`Failed to send invite to ${email}: ${inviteEmailError.message}`);
        }

        console.log(`Successfully sent invite to ${email}`);
        return { email, success: true, invite_id: inviteData.invite_id };
      })
    );

    // Separate successes and failures
    const successes = results.filter((r): r is PromiseFulfilledResult<{ email: string; success: boolean; invite_id: string }> => r.status === "fulfilled").map((r) => r.value);
    const failures = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => ({
        error: r.reason.message,
      }));

    console.log(`Invite results - Success: ${successes.length}, Failed: ${failures.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successes.length,
        failed: failures.length,
        results: {
          successes,
          failures,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Send invites error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send invites";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Error details:", { message: errorMessage, stack: errorStack });

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorStack,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
