// app/admin/SignOut.tsx
'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib//supabase';

const SignOut: React.FC = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      // Redirect to the home page after signing out
      router.push('/');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Sign Out</h2>
      <button onClick={handleSignOut} className="bg-red-500 text-white p-2 rounded">
        Sign Out
      </button>
    </div>
  );
};

export default SignOut;