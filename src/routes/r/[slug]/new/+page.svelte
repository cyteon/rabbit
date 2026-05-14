<script>
    /** @type {import('./$types').PageData} */
    export let data;

    let slug = data.slug;

    import Navbar from "$lib/components/navbar.svelte";
    import Sidebar from "$lib/components/sidebar.svelte";
    import { onMount } from "svelte";

    import { goto } from "$app/navigation";
    import SignedIn from "clerk-sveltekit/client/SignedIn.svelte";
    import SignedOut from "clerk-sveltekit/client/SignedOut.svelte";
    import SignIn from "clerk-sveltekit/client/SignIn.svelte";

    let notFound = false;

    onMount(async () => {
        try {
            let response = await fetch(`/api/r/${slug}`);

            if (response.status == 200) {
                let json = await response.json();

                console.log(json);
            } else {
                notFound = true;
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            notFound = true;
        }
    });

    let title = "";
    let content = "";

    async function createPost() {
        let response = await fetch(`/api/r/${slug}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                subrabbit: slug,
                content: content,
                author: window.Clerk?.user.id,
            }),
        });

        let json = await response.json();

        if (response.status == 201) {
            goto(json.url);
        } else {
            console.log(json.message);
        }
    }
</script>

<body class="bg-ctp-base text-ctp-text h-screen flex flex-col">
    {#if notFound}
        <div class="flex flex-col items-center m-auto">
            <h1 class="text-5xl text-ctp-red">404 Not Found</h1>
            <a
                class="text-xl text-ctp-text transition-all duration-300 hover:scale-105"
                href="/">Return Home</a
            >
        </div>
    {:else}
        <SignedIn>
            <Navbar />

            <div class="w-full flex flex-row h-full">
                <Sidebar />

                <div
                    class="flex flex-col bg-ctp-surface0 rounded-md w-full m-5 max-h-screen h-fit"
                >
                    <div class="flex flex-col m-5">
                        <p class="text-lg">
                            New Post in
                            <span class="font-semibold">r/{slug}</span>
                        </p>
                        <input
                            class="mt-1 w-full rounded-md p-2 bg-ctp-mantle"
                            type="text"
                            placeholder="Post Title"
                            bind:value={title}
                        />
                        <textarea
                            class="mt-1 w-full rounded-md p-2 bg-ctp-mantle"
                            type="text"
                            rows="12"
                            placeholder="Post Content"
                            bind:value={content}
                        />
                        <button
                            class="mt-4 bg-ctp-blue text-gray-800 p-2 rounded w-full"
                            on:click={createPost}
                        >
                            Create
                        </button>
                    </div>
                </div>
            </div>
        </SignedIn>

        <SignedOut>
            <div class="absolute w-full">
                <Navbar />
            </div>
            <div class="flex justify-center h-screen w-[100%]">
                <div class="mt-auto mb-auto">
                    <SignIn redirectUrl={`/r/${slug}/new`} />
                </div>
            </div>
        </SignedOut>
    {/if}
</body>
