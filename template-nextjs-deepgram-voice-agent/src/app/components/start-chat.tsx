import Link from "next/link";
import { useSignIn } from '@clerk/nextjs'
import { useState,useEffect} from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Turnstile } from '@marsidev/react-turnstile'
import { verifyToken } from "@/app/actions/verify-token";
import { Mic as MicIcon, ChartArea, Clock, ArrowRight,Loader2,PhoneCall } from "lucide-react";
export const VoiceSurveyConsent = ({ 
  startAgent, 
  user,
  formData
}: { 
  startAgent: () => void; 
  user: string;
  formData: any;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const params = useParams();
  const formID = params.formID as string;

  const { signIn, isLoaded } = useSignIn();

  const signInWithGoogle = async () => {
    if (!isLoaded) return;
    
    setIsLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: `/c/${formID}`,
      });
    } catch (err) {
      console.error('Error:', err);
      setIsLoading(false);
    }
  };

  const handleToken = (token: string) => {
    setTurnstileToken(token);
    setIsVerified(true);
  };

  const handleStart = async () => {
    setIsLoading(true);
    try {
      if (!isVerified || !turnstileToken) {
        toast.error("Please complete the verification challenge first.");
        setIsLoading(false);
        return;
      }

      console.log("turnstileToken", turnstileToken);
      
      const verified = await verifyToken(turnstileToken);
      if (!verified) {
        toast.error("Human verification failed. Please try again.");
        setIsLoading(false);
        setIsVerified(false);
        return;
      }

      await startAgent();
    } catch (error) {
      console.error("Failed to start agent:", error);
      setIsLoading(false);
    }
  };



  return (
    <div className="w-full max-w-[480px] bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-200/50 p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
      {/* Icon/Brand Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
          <PhoneCall size={32} strokeWidth={1.5} className="text-gray-900" />
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 mb-2">
          Live survey
        </h1>
        <p className="text-[15px] text-gray-500 font-medium">
          {formData?.title || "Agentic Interview"}
        </p>
      </div>

      {/* Feature Grid - The "Preview" */}
      <div className="grid grid-cols-1 gap-6 mb-10 px-2">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50">
            <Clock size={18} className="text-gray-600" />
          </div>
          <div className="text-left">
            <h4 className="text-[14px] font-semibold text-gray-900">Questions</h4>
            <p className="text-[13px] text-gray-500 leading-snug">{formData?.questions?.length || 0} questions</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50">
            <ChartArea size={18} className="text-gray-600" />
          </div>
          <div className="text-left">
            <h4 className="text-[14px] font-semibold text-gray-900">Conversational Flow</h4>
            <p className="text-[13px] text-gray-500 leading-snug">Natural, guided conversation with AI.</p>
          </div>
        </div>
      </div>

      <Turnstile 
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} 
        onSuccess={handleToken} 
      />

      {/* Show verification status */}
      {!isVerified && (
        <p className="text-center text-[13px] text-gray-500  animate-pulse mt-3 mb-2">
          Verifying if you are human...
        </p>
      )}
      
      {/* Authentication/CTA Section */}
      <div className="space-y-4 mt-6">
        {user ? (
          <button
            onClick={handleStart}
            disabled={isLoading || !isVerified}
            className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 text-[15px] font-semibold text-white transition-all hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-gray-900 disabled:active:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                Start Survey
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-center text-[12px] text-gray-400 mb-1">
              Verify your identity to begin the session
            </p>
            <button 
              onClick={signInWithGoogle} 
              disabled={!isVerified}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white py-4 text-[15px] font-semibold text-gray-800 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        )}
        
        <button 
          disabled={isLoading}
          className="w-full text-[14px] font-medium text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Link href="/">
            Cancel
          </Link>
        </button>
      </div>
    </div>
  );
};
