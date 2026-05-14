<script>
    import UserButton from "clerk-sveltekit/client/UserButton.svelte";
    import SignInButton from "clerk-sveltekit/client/SignInButton.svelte";
    import SignedOut from "clerk-sveltekit/client/SignedOut.svelte";
</script>

<nav class="bg-ctp-mantle border-ctp-surface0 border-b-[1px]">
    <div class="p-3 py-2 flex flex-row">
        <a class="text-ctp-text text-xl mt-auto mb-auto font-bold" href="/"
            >Rabbit</a
        >
        <div class="justify-end ml-auto">
            <UserButton />
            <SignedOut>
                <button
                    class="text-ctp-crust bg-ctp-blue py-1 px-3 rounded-md transition-all hover:scale-105 duration-300 shadow-md"
                >
                    <SignInButton />
                </button>
            </SignedOut>
        </div>
    </div>
</nav>
