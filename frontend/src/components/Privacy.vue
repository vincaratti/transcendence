<template>
	<div class="min-h-screen bg-zinc-950 text-white">
		<div class="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
			<header class="flex items-center justify-between">
				<h1 class="text-2xl tracking-widest font-bold uppercase">Privacy Policy</h1>
				<RouterLink
					to="/"
					class="px-4 py-1.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
				>
					Back
				</RouterLink>
			</header>

			<p class="text-xs text-zinc-500 uppercase tracking-wide">Last updated: 15 July 2026</p>

			<section class="flex flex-col gap-3">
				<p class="text-sm text-zinc-300 leading-relaxed">
					Codenames Online is a student project built for the 42 curriculum. It is operated by the
					project team as a non-commercial application. This policy explains exactly what data the
					application stores about you, why it stores it, and what you can do about it.
				</p>
				<p class="text-sm text-zinc-300 leading-relaxed">
					We do not sell your data, we do not share it with advertisers, and we do not use
					third-party analytics or tracking services of any kind.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">1. Data we collect</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					All of the following is data you provide directly or that the game generates as you play.
					We do not collect anything else.
				</p>
				<div class="rounded-lg border border-zinc-800 divide-y divide-zinc-800">
					<div v-for="item in collected" :key="item.what" class="px-4 py-3">
						<p class="text-sm font-semibold text-zinc-200">{{ item.what }}</p>
						<p class="text-sm text-zinc-400 leading-relaxed mt-1">{{ item.why }}</p>
					</div>
				</div>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">2. How your password is handled</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					Your password is never stored in readable form. It is hashed with bcrypt using a
					per-password salt before it reaches the database, and the original is discarded. Nobody on
					the project team can read or recover it. If you forget it, it cannot be retrieved, only
					replaced.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">3. Sessions and local storage</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					When you log in, the server issues a signed JSON Web Token that identifies you for the
					next 24 hours. This token, along with a cached copy of your public profile, is kept in your
					browser's <code class="text-zinc-200 bg-zinc-800 rounded px-1 py-0.5 text-xs">localStorage</code>
					so that you stay logged in between page loads.
				</p>
				<p class="text-sm text-zinc-300 leading-relaxed">
					This application sets no cookies and runs no advertising or tracking scripts. Logging out
					clears the token and the cached profile from your browser immediately.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">4. Who can see what</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					Your username, avatar, sign-up date, match history, achievements and leaderboard standing
					are visible to any other signed-in user. Treat them as public.
				</p>
				<p class="text-sm text-zinc-300 leading-relaxed">
					Your email address and password hash are never exposed to other users through the API.
					Chat messages are readable by the recipient and, because they are stored unencrypted in
					the database, by anyone with administrative access to the server. Please do not send
					anything sensitive through the chat.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">5. Storage and security</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					Data is stored in a PostgreSQL database that is not reachable from the public internet.
					Uploaded avatars are written to the server's filesystem under randomly generated
					filenames. All traffic between your browser and the server, including WebSocket
					connections, is encrypted with TLS 1.2 or 1.3.
				</p>
				<p class="text-sm text-zinc-300 leading-relaxed">
					This is a student project rather than a production service. We have applied the security
					practices required by the curriculum, but you should not rely on it to hold anything
					important, and you should not reuse a password here that you use elsewhere.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">6. Retention and deletion</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					Your account data is kept for as long as your account exists. You can change your
					username, email, password and avatar at any time from your dashboard. Replacing your
					avatar deletes the previous image file from the server.
				</p>
				<p class="text-sm text-zinc-300 leading-relaxed">
					If you ask us to delete your account, we remove your user record. Your player entries,
					friendships, chat messages, and unlocked achievements are removed along with it through
					cascading deletion. Games you took part in may remain, since they belong to the other
					players too.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">7. Your rights</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					You can ask for a copy of the data we hold about you, ask for it to be corrected, or ask
					for your account to be deleted. Contact the project team through the repository to make a
					request.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">8. Changes to this policy</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					If this policy changes, the date at the top of this page changes with it. Continuing to
					use the application after that point means you accept the updated policy.
				</p>
			</section>

			<Footer />
		</div>
	</div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import Footer from './Footer.vue'

const collected = [
	{
		what: 'Username and email address',
		why: 'Provided at registration. The username identifies you to other players; the email is your login identifier and must be unique.',
	},
	{
		what: 'Password',
		why: 'Provided at registration and stored only as a bcrypt hash. See section 2.',
	},
	{
		what: 'Avatar image',
		why: 'Optional. If you upload one it is stored on the server and shown to other players. If you do not, a default avatar is displayed instead.',
	},
	{
		what: 'Game and match history',
		why: 'Every game you join records your team, your role, and the result. This drives your stats, your achievements, and the global leaderboard.',
	},
	{
		what: 'Friend relationships',
		why: 'Who you sent friend requests to, who accepted, and your online or offline status while connected.',
	},
	{
		what: 'Chat messages',
		why: 'Direct messages you send are stored so they can be delivered and re-read. We also store the list of users you have blocked.',
	},
	{
		what: 'Session token',
		why: 'A signed JWT kept in your browser to keep you logged in. See section 3.',
	},
]
</script>
