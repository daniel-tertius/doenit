<script>
  import { notifications } from "$lib/services/notification.svelte";
  import { SplashScreen } from "@capacitor/splash-screen";
  import { Widget } from "$lib/services/widget";
  import { Capacitor } from "@capacitor/core";
  // import { OnlineDB } from "$lib/OnlineDB";
  import Heading from "./Heading.svelte";
  import { goto } from "$app/navigation";
  import Footer from "./Footer.svelte";
  import { App } from "@capacitor/app";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { DB } from "$lib/DB";
  import "../app.css";

  let { children } = $props();

  onMount(() => {
    // Subscribe to auth state changes and only access Firestore when properly authenticated
    // const unsubscribeAuth = user.subscribe((currentUser) => {
    //   if (!!currentUser && !currentUser?.isAnonymous) {
    //     console.log("Authenticated user:", currentUser.email, "- subscribing to Firestore");
    //     try {
    //       OnlineDB.Task.subscribe((tasks) => {
    //         console.log("Received", tasks.length, "tasks from Firestore");
    //         if (!tasks.length) return;
    //         DB.Task.overwriteMany(tasks);
    //       });
    //     } catch (error) {
    //       console.error("Failed to subscribe to Firestore:", error);
    //     }
    //   } else {
    //     console.log("User not properly authenticated (anonymous or null), skipping Firestore subscription");
    //   }
    // });

    DB.Task.subscribe(handleTasksUpdate, { selector: { archived: { $ne: true } } });

    /**
     * @param {Task[]} tasks
     */
    function handleTasksUpdate(tasks) {
      notifications.scheduleNotifications(tasks);
      Widget.updateWidget(tasks);
    }

    App.addListener("backButton", (event) => {
      if (page.url.pathname === "/") {
        App.exitApp();
      } else {
        goto("/", { invalidateAll: false });
      }
    });

    // Listen for task completion events from native side
    window.addEventListener("taskCompleted", async (event) => {
      console.log("[💬 Doenit] Task completed event received");
      Widget.finishTasks(event.detail.task_ids);
    });

    SplashScreen.hide();
  });
</script>

<div class="text-md h-dvh flex flex-col text-normal **:select-none **:transition-all **:duration-300">
  <Heading />

  <main class="max-w-[1000px] w-full md:mx-auto grow overflow-y-auto bg-page p-2">
    {@render children()}
  </main>

  <Footer />
</div>
