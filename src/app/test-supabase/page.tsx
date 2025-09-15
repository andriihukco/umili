"use client";

import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Using Card instead of Alert component

export default function TestSupabasePage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Test 1: Configuration check
      addResult("Testing Supabase configuration...");
      const isConfigured = isSupabaseConfigured();
      addResult(`Configuration check: ${isConfigured ? "PASS" : "FAIL"}`);

      if (!isConfigured) {
        addResult("ERROR: Supabase not configured properly");
        setIsLoading(false);
        return;
      }

      // Test 2: Basic connection test
      addResult("Testing basic connection...");
      try {
        const { error } = await supabase.from("users").select("count").limit(1);
        if (error) {
          addResult(`Connection test FAILED: ${JSON.stringify(error)}`);
        } else {
          addResult("Connection test: PASS");
        }
      } catch (err) {
        addResult(`Connection test ERROR: ${err}`);
      }

      // Test 3: Test task creation (dry run)
      addResult("Testing task table access...");
      try {
        const { error } = await supabase.from("tasks").select("id").limit(1);
        if (error) {
          addResult(`Task table access FAILED: ${JSON.stringify(error)}`);
        } else {
          addResult("Task table access: PASS");
        }
      } catch (err) {
        addResult(`Task table access ERROR: ${err}`);
      }

      // Test 4: Test categories table
      addResult("Testing categories table access...");
      try {
        const { error } = await supabase
          .from("categories")
          .select("id")
          .limit(1);
        if (error) {
          addResult(`Categories table access FAILED: ${JSON.stringify(error)}`);
        } else {
          addResult("Categories table access: PASS");
        }
      } catch (err) {
        addResult(`Categories table access ERROR: ${err}`);
      }
    } catch (error) {
      addResult(`Unexpected error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>
            This page helps diagnose Supabase connectivity and configuration
            issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests} disabled={isLoading} className="w-full">
            {isLoading ? "Running Tests..." : "Run Supabase Tests"}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Test Results:</h3>
              <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="text-sm text-blue-800">
                <strong>Note:</strong> If tests fail, check your environment
                variables in .env.local:
                <br />
                • NEXT_PUBLIC_SUPABASE_URL
                <br />• NEXT_PUBLIC_SUPABASE_ANON_KEY
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
