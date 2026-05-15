<script lang="ts">
    import Navbar from "$lib/components/navbar.svelte";
    import Sidebar from "$lib/components/sidebar.svelte";

    import FaCaretSquareUp from "svelte-icons/fa/FaCaretSquareUp.svelte";
    import FaCaretSquareDown from "svelte-icons/fa/FaCaretSquareDown.svelte";

    import { marked } from "marked";
    import DOMPurify from "dompurify";

    import { onMount } from "svelte";
    import fetchUser from "$lib/fetchUser";

    let json = { posts: [] };

    let selfData = { data: { votes: {} } };

    onMount(async () => {
        try {
            let response;

            try {
                let response = await fetch(`/api/u/self`);

                if (response.status == 200) {
                    selfData = await response.json();
                }
            } catch (_) {}

            response = await fetch(`/api/posts/top`);

            if (response.status == 200) {
                json = await response.json();
            } else if (response.status == 404) {
                console.log("Couldn't find posts");
            }

            for (let index = 0; index < json.posts.length; index++) {
                try {
                    const post = json.posts[index];
                    let userData = await fetchUser(post.author_clerk_id);

                    if (userData === null) {
                        continue;
                    }

                    console.log(userData);

                    json.posts[index].imageUrl = userData.imageUrl;
                    json.posts[index].username = userData.username;

                    json.posts[index].content = DOMPurify.sanitize(
                        marked.parse(json.posts[index].content),
                    );
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }

        setTimeout(() => {
            Prism.highlightAll();
        }, 500);
    });

    async function votePost(vote, post) {
        try {
            let response = await fetch(
                `/api/r/${post.subrabbit_name}/${post.id_rand}/vote`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        vote: vote,
                        user_id: selfData.data.id,
                        subrabbit: post.subrabbit,
                        post: post.id,
                    }),
                },
            );

            if (response.status === 200) {
                let json = await response.json();
                post.votes = json.votes;

                selfData.data.votes[post.id] = vote;
            }
        } catch (error) {
            console.error("Error voting post:", error);
        }
    }

    function downvote(event, post) {
        event.stopPropagation();
        votePost(-1, post);
    }

    function upvote(event, post) {
        event.stopPropagation();
        votePost(1, post);
    }
</script>

<body class="bg-ctp-base h-screen flex flex-col">
    <Navbar />

    <div class="flex flex-row h-full">
        <Sidebar />

        <div
            class="flex flex-col bg-ctp-surface0 w-full m-5 rounded-xl gap-3 p-3"
        >
            {#each json.posts as post}
                <div
                    class="flex flex-col bg-ctp-surface1 rounded-md p-3 transition-all duration-300 hover:scale-[100.5%] hover:cursor-pointer overflow-hidden"
                    on:click={() => {
                        window.location.href = `/r/${post.subrabbit_name}/${post.id_rand}`;
                    }}
                >
                    <div class="flex flex-row">
                        <a
                            href={`/u/${post.author}`}
                            class="my-auto"
                            on:click|stopPropagation
                        >
                            <img
                                class="h-8 w-8 rounded-full mr-2"
                                src={post.imageUrl}
                                alt="avatar"
                            />
                        </a>
                        <div class="flex flex-col">
                            <a
                                href={`/r/${post.subrabbit_name}`}
                                class="text-sm text-ctp-text font-bold"
                                on:click|stopPropagation
                            >
                                r/{post.subrabbit_name}
                            </a>
                            <a
                                href={`/u/${post.author}`}
                                class="text-sm text-ctp-text">{post.username}</a
                            >
                        </div>
                    </div>
                    <h1 class="text-2xl text-ctp-text">{post.title}</h1>
                    <div>
                        <p
                            class="text-base text-ctp-text max-h-24 overflow-hidden prose prose-sm"
                        >
                            {@html post.content}
                        </p>
                    </div>
                    <div class="flex flex-row">
                        <div
                            class="text-ctp-text bg-ctp-surface0 w-fit py-2 px-3 flex flex-row rounded-full"
                        >
                            {#if post.id in selfData.data.votes}
                                {#if selfData.data.votes[post.id] == -1}
                                    <button
                                        on:click={(event) =>
                                            upvote(event, post)}
                                        class="w-5 transition-all duration-300 hover:scale-110"
                                    >
                                        <FaCaretSquareUp />
                                    </button>
                                    <p class="mx-2">{post.votes}</p>
                                    <button
                                        on:click={(event) =>
                                            downvote(event, post)}
                                        class="w-5 transition-all duration-300 hover:scale-110 text-ctp-blue"
                                    >
                                        <FaCaretSquareDown />
                                    </button>
                                {:else}
                                    <button
                                        on:click={(event) =>
                                            upvote(event, post)}
                                        class="w-5 transition-all duration-300 hover:scale-110 text-ctp-blue"
                                    >
                                        <FaCaretSquareUp />
                                    </button>
                                    <p class="mx-2">{post.votes}</p>
                                    <button
                                        on:click={(event) =>
                                            downvote(event, post)}
                                        class="w-5 transition-all duration-300 hover:scale-110"
                                    >
                                        <FaCaretSquareDown />
                                    </button>
                                {/if}
                            {:else}
                                <button
                                    on:click={(event) => upvote(event, post)}
                                    class="w-5 transition-all duration-300 hover:scale-110"
                                >
                                    <FaCaretSquareUp />
                                </button>
                                <p class="mx-2">{post.votes}</p>
                                <button
                                    on:click={(event) => downvote(event, post)}
                                    class="w-5 transition-all duration-300 hover:scale-110"
                                >
                                    <FaCaretSquareDown />
                                </button>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</body>
