"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Home: React.FC = () => {
  const [phone, setPhone] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>("");
  const router = useRouter();

  const handleCheckIn = async () => {
    try {
      const response = await fetch("/api/findParent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSearchError(errorData.message);
        return;
      }

      const parent = await response.json();

      if (parent && parent.children.length > 0) {
        // If parent found, pass children to check-in page as query parameters
        const childrenData = encodeURIComponent(
          JSON.stringify(parent.children)
        );
        router.push(
          `/check-in?children=${childrenData}&parentName=${encodeURIComponent(
            parent.name
          )}`
        );
      } else {
        setSearchError("No children found for this phone number");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("An error occurred while searching");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 relative">
      <h1 className="text-2xl font-bold mb-4">Sunday School Attendance</h1>
      <div className="w-full max-w-md">
        <Input
          type="tel"
          value={phone}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/\D/g, "");
            setPhone(numericValue);
            setSearchError(""); // Clear error when typing
          }}
          placeholder="Enter Parent's Phone Number"
          className="mb-2 w-full"
        />
        {searchError && (
          <p className="text-red-500 text-sm mb-2">{searchError}</p>
        )}
        <Button
          onClick={handleCheckIn}
          className="w-full"
          disabled={phone.length < 10}
        >
          Check
        </Button>
      </div>

      {/* Settings Icon */}
      <div className="absolute top-4 right-4">
        <Button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          variant="outline"
        >
          ⚙️
        </Button>
      </div>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50">
          <div className="absolute top-0 right-0 w-64 h-full bg-white shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <Button
              onClick={() => {
                router.push("/admin");
                setIsSidebarOpen(false);
              }}
              className="mb-2"
            >
              Admin
            </Button>
            <Button onClick={() => setIsSidebarOpen(false)} className="mb-4">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
