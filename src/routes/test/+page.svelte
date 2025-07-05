<script>
  import { api } from "$lib/services/api";
  import { user } from "$lib/services/auth";

  let testResult = "";
  let isLoading = false;

  async function testConnection() {
    isLoading = true;
    testResult = "";

    try {
      console.log("Testing API connection...");
      const result = await api.getTasks();
      testResult = `✅ Success! Retrieved ${result.data?.length || 0} tasks`;
      console.log("API test result:", result);
    } catch (error) {
      testResult = `❌ Error: ${error.message}`;
      console.error("API test error:", error);
    } finally {
      isLoading = false;
    }
  }

  async function testCreateTask() {
    isLoading = true;
    testResult = "";

    try {
      console.log("Testing task creation...");
      const result = await api.createTask({
        title: "Test Task",
        description: "This is a test task created from the frontend",
        category: "test",
        priority: "medium",
      });
      testResult = `✅ Task created successfully! ID: ${result.data?._id}`;
      console.log("Create task result:", result);
    } catch (error) {
      testResult = `❌ Error: ${error.message}`;
      console.error("Create task error:", error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="p-4 space-y-4">
  <h1 class="text-2xl font-bold">API Connection Test</h1>

  <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
    <p><strong>User Authenticated:</strong> {$user?.uid || "None"}</p>
    <p><strong>Email:</strong> {$user?.email || "Anonymous"}</p>
  </div>

  <div class="space-x-4">
    <button
      onclick={testConnection}
      disabled={isLoading}
      class="bg-blue-500 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
    >
      {isLoading ? "Testing..." : "Test Get Tasks"}
    </button>

    <button
      onclick={testCreateTask}
      disabled={isLoading}
      class="bg-green-500 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
    >
      {isLoading ? "Testing..." : "Test Create Task"}
    </button>
  </div>

  {#if testResult}
    <div
      class="p-4 border rounded-lg {testResult.startsWith('✅')
        ? 'bg-green-100 border-green-400 text-green-700'
        : 'bg-red-100 border-red-400 text-red-700'}"
    >
      <pre>{testResult}</pre>
    </div>
  {/if}

  <div class="text-sm text-gray-600">
    <h3 class="font-semibold">Instructions:</h3>
    <ol class="list-decimal list-inside space-y-1">
      <li>First, authenticate using the "Quick Test (Anonymous)" button</li>
      <li>Then test the API connection with "Test Get Tasks"</li>
      <li>If that works, try creating a task with "Test Create Task"</li>
    </ol>
  </div>
</div>
