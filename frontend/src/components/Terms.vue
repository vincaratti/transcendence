<template>
	<div class="min-h-screen bg-zinc-950 text-white">
		<div class="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
			<header class="flex items-center justify-between">
				<h1 class="text-2xl tracking-widest font-bold uppercase">Terms of Service</h1>
				<RouterLink
					to="/"
					class="px-4 py-1.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
				>
					Back
				</RouterLink>
			</header>

			<p class="text-xs text-zinc-500 uppercase tracking-wide">Last updated: 15 July 2026</p>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">1. What this is</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					Codenames Online is a free, non-commercial web implementation of the word-deduction game
					Codenames, built by students as part of the 42 curriculum. By creating an account or using
					the application you agree to these terms. If you do not agree with them, please do not use
					the application.
				</p>
				<p class="text-sm text-zinc-300 leading-relaxed">
					Codenames is a board game published by Czech Games Edition. This project is an unofficial,
					educational implementation. It is not affiliated with, endorsed by, or sponsored by the
					publisher, and it is not offered for sale.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">2. Your account</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					You need an account to play. You agree to provide a valid email address, to keep your
					password to yourself, and to accept responsibility for anything done through your account.
					One person, one account. Do not register on someone else's behalf or impersonate another
					player through your username or avatar.
				</p>
				<p class="text-sm text-zinc-300 leading-relaxed">
					Because this is a student project, do not reuse a password that protects anything else
					that matters to you.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">3. Acceptable use</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">You agree not to:</p>
				<ul class="flex flex-col gap-2">
					<li v-for="rule in rules" :key="rule" class="flex gap-3 text-sm text-zinc-300 leading-relaxed">
						<span class="text-zinc-600 select-none">&bull;</span>
						<span>{{ rule }}</span>
					</li>
				</ul>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">4. Content you submit</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					You keep ownership of the avatar images and chat messages you submit. You grant us
					permission to store and display them as needed to run the application, for example showing
					your avatar to other players and delivering your messages to their recipients.
				</p>
				<p class="text-sm text-zinc-300 leading-relaxed">
					You are responsible for what you upload. Only upload an image you have the right to use.
					Avatars must be a JPEG, PNG, GIF or WebP file of 2 MB or less. We may remove content that
					breaks these terms.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">5. Fair play</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					Codenames depends on the Spymaster's view of the board staying private. Sharing that view
					with your Operative outside the game, whether by screen sharing, a second account, or any
					other channel, ruins the game for everyone at the table. Play in good faith.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">6. Availability and data loss</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					The application is provided as is, with no warranty of any kind. It is a school project
					with no uptime guarantee. It may be taken offline, reset, or have its database wiped at any
					time without notice, including as part of evaluation or grading. Do not store anything in
					it that you would be upset to lose.
				</p>
				<p class="text-sm text-zinc-300 leading-relaxed">
					To the fullest extent the law allows, the project team is not liable for any loss or
					damage arising from your use of the application.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">7. Suspension and termination</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					We may suspend or remove an account that breaks these terms. You can stop using the
					application at any time and ask us to delete your account, as described in the
					<RouterLink to="/privacy" class="text-zinc-100 underline underline-offset-2 hover:text-white">
						Privacy Policy</RouterLink>.
				</p>
			</section>

			<section class="flex flex-col gap-3">
				<h2 class="text-lg font-semibold">8. Changes to these terms</h2>
				<p class="text-sm text-zinc-300 leading-relaxed">
					If these terms change, the date at the top of this page changes with it. Continuing to use
					the application after that point means you accept the updated terms.
				</p>
			</section>

			<Footer />
		</div>
	</div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import Footer from './Footer.vue'

const rules = [
	'Harass, threaten, or abuse other players, in chat or through your username or avatar.',
	'Upload or send content that is illegal, hateful, sexually explicit, or that you do not have the right to share.',
	'Attempt to access another user\'s account, or any data or game state that is not yours.',
	'Probe, scan, or attack the service, or try to disrupt it for other players.',
	'Automate play with bots or scripts, or interfere with the outcome of other people\'s games.',
	'Use the application in a way that breaks the law where you live.',
]
</script>
