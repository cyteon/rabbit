<script lang="ts">
    import MdHome from "svelte-icons/md/MdHome.svelte";
    import MdArrowDropDown from "svelte-icons/md/MdArrowDropDown.svelte";
    import MdAdd from "svelte-icons/md/MdAdd.svelte";
    import SignedIn from "clerk-sveltekit/client/SignedIn.svelte";

    import { goto } from "$app/navigation";

    import { onMount } from "svelte";

    // State variable to control the visibility of the popup
    let showPopup = false;
    let communityName = "";
    let communityDescription = "";
    let communityError = "";

    let newestSubrabbits: [
        {
            id: number;
            name: string;
            description: string;
            owner: string;
            created_at: string;
        },
    ] = [];

    function togglePopup() {
        showPopup = !showPopup;
        communityName = "";
        communityDescription = "";
        communityError = "";
    }

    let json = { data: { subrabbits_interacted_with: [] } };

    onMount(async () => {
        try {
            let response = await fetch(`/api/u/self`);

            if (response.status == 200) {
                json = await response.json();
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        }

        var response = await fetch("/api/subrabbits/sort/newest");

        if (response.status == 200) {
            var body = await response.json();
            newestSubrabbits = body.data;
        }
    });

    async function createCommunity() {
        console.log(communityName);
        console.log(communityDescription);

        if (communityName == "") {
            communityError = "Community name cannot be empty";
            return;
        }

        if (communityName.includes("/")) {
            communityError = "Community name cannot contain '/'";
            return;
        }

        let response = await fetch("/api/subrabbits/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: communityName,
                description: communityDescription,
                owner: window?.Clerk?.user?.id,
            }),
        });

        let json = await response.json();

        if (response.status == 201) {
            goto(json.url);
        } else {
            communityError = json.message;
        }
    }

    let showAccordion = false;
    let showAccordion2 = false;
</script>

<nav
    class="bg-ctp-mantle border-ctp-surface0 border-r-[1px] w-64 h-full text-ctp-text sticky top-0"
>
    <div class="m-2">
        <a
            class="flex flex-row w-full transition-all min-h-12 duration-300 hover:bg-black/15 p-1 px-2 rounded-lg"
            href="/"
        >
            <div class="h-8 mt-auto mb-auto"><MdHome /></div>
            <p class="text-base m-auto">Home</p>
        </a>

        <SignedIn>
            <hr class="border-ctp-surface0 m-1 border-t-[1px]" />
            <div class="accordion">
                <div
                    role="aria-button"
                    class="flex flex-row items-center justify-between cursor-pointer min-h-12 p-1 px-2 rounded-lg transition-all duration-300 hover:bg-black/15"
                    on:click={() => (showAccordion = !showAccordion)}
                >
                    <p>Communities</p>
                    <div class="h-6"><MdArrowDropDown /></div>
                </div>
                <div
                    class="accordion-content"
                    style:max-height={showAccordion ? "200px" : "0px"}
                >
                    <button
                        class="flex flex-row w-full transition-all duration-300 hover:bg-black/15 p-1 rounded-lg"
                        on:click={togglePopup}
                    >
                        <div class="h-8"><MdAdd /></div>
                        <p class="text-base m-auto">Create</p>
                    </button>
                </div>
            </div>
        </SignedIn>

        <hr class="border-ctp-surface0 m-1 border-t-[1px]" />

        <div class="accordion">
            <div
                role="aria-button"
                class="flex flex-row items-center justify-between cursor-pointer min-h-12 p-1 px-2 rounded-lg transition-all duration-300 hover:bg-black/15"
                on:click={() => (showAccordion2 = !showAccordion2)}
            >
                <p>Recently Made</p>
                <div class="h-6"><MdArrowDropDown /></div>
            </div>
            <div
                class="accordion-content"
                style:max-height={showAccordion2 ? "200px" : "0px"}
            >
                {#each newestSubrabbits as subrabbit}
                    <button
                        class="flex flex-row w-full transition-all duration-300 hover:bg-black/15 p-1 rounded-lg"
                        on:click={() => goto(`/r/${subrabbit.name}`)}
                    >
                        r/{subrabbit.name}
                    </button>
                {/each}
            </div>
        </div>
    </div>
</nav>

{#if showPopup}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div class="bg-ctp-surface0 p-6 rounded-lg shadow-lg">
            <h2 class="text-lg font-bold text-ctp-text">Create a Community</h2>

            <form class="mt-4">
                <label class="block">
                    <span class="text-ctp-text">Name</span>
                    <input
                        class="mt-1 text-ctp-text w-full rounded-md p-2 bg-ctp-mantle"
                        type="text"
                        placeholder="Community Name"
                        bind:value={communityName}
                    />
                </label>
                <label class="block mt-2">
                    <span class="text-ctp-text">Description</span>
                    <textarea
                        class="mt-1 text-ctp-text w-full rounded-md p-2 bg-ctp-mantle"
                        placeholder="Community Description"
                        bind:value={communityDescription}
                    ></textarea>
                </label>

                <button
                    class="mt-4 bg-ctp-blue text-ctp-mantle p-2 rounded w-full"
                    on:click={createCommunity}
                >
                    Create
                </button>
                <p class="text-ctp-red text-sm">{communityError}</p>

                <button
                    class="mt-1 bg-ctp-blue text-ctp-mantle p-2 rounded w-full"
                    on:click={togglePopup}
                >
                    Cancel
                </button>
            </form>
        </div>
    </div>
{/if}

<style>
    .accordion-content {
        overflow: hidden;
        transition: max-height 0.3s ease;
    }
</style>
